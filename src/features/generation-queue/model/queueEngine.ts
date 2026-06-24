import type { GenerationTask, GenType } from "@/entities/generation-task";
import type { Dispatch } from "react";
import type { QueueAction, QueueState } from "./queueReducer";

export const MAX_CONCURRENT = 2;

const FAILURE_MESSAGES = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
] as const;

const TYPE_DURATION_RANGE_SECONDS: Record<GenType, readonly [number, number]> = {
  text: [12, 22],
  image: [25, 45],
  audio: [55, 95],
  video: [90, 150],
};

interface TaskRuntimeMeta {
  totalDurationSeconds: number;
  shouldFail: boolean;
  failAtProgress: number;
  failMessage: string;
}

export interface QueueEngine {
  start: () => void;
  stop: () => void;
}

export interface QueueEngineOptions {
  getState: () => QueueState;
  dispatch: Dispatch<QueueAction>;
  tickIntervalMs?: number;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomIntBetween(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function isActiveTask(task: GenerationTask): boolean {
  return task.status === "queued" || task.status === "running";
}

function etaForTask(task: GenerationTask, totalDurationSeconds: number): number {
  const leftRatio = Math.max(0, 1 - task.progress / 100);
  return Math.max(1, Math.ceil(totalDurationSeconds * leftRatio));
}

function createRuntimeMeta(task: GenerationTask): TaskRuntimeMeta {
  const [minDuration, maxDuration] = TYPE_DURATION_RANGE_SECONDS[task.type];
  return {
    totalDurationSeconds: randomIntBetween(minDuration, maxDuration),
    shouldFail: Math.random() < 0.15,
    failAtProgress: randomIntBetween(30, 92),
    failMessage: FAILURE_MESSAGES[randomIntBetween(0, FAILURE_MESSAGES.length - 1)],
  };
}

function getOrCreateMeta(task: GenerationTask, runtimeMetaMap: Map<string, TaskRuntimeMeta>): TaskRuntimeMeta {
  const fromMap = runtimeMetaMap.get(task.id);
  if (fromMap) return fromMap;
  const created = createRuntimeMeta(task);
  runtimeMetaMap.set(task.id, created);
  return created;
}

function getQueuedTasks(tasks: GenerationTask[]): GenerationTask[] {
  return tasks
    .filter((task) => task.status === "queued")
    .sort((a, b) => a.createdAt - b.createdAt);
}

function getRunningTasks(tasks: GenerationTask[]): GenerationTask[] {
  return tasks.filter((task) => task.status === "running");
}

export function createQueueEngine(options: QueueEngineOptions): QueueEngine {
  const tickIntervalMs = options.tickIntervalMs ?? randomIntBetween(400, 700);
  const runtimeMetaMap = new Map<string, TaskRuntimeMeta>();

  let intervalId: ReturnType<typeof setInterval> | null = null;

  function syncRunningSlots(state: QueueState): void {
    const running = getRunningTasks(state.tasks);
    if (running.length >= MAX_CONCURRENT) return;

    const availableSlots = MAX_CONCURRENT - running.length;
    const queued = getQueuedTasks(state.tasks).slice(0, availableSlots);
    const startedAt = Date.now();

    queued.forEach((task) => {
      const meta = getOrCreateMeta(task, runtimeMetaMap);
      options.dispatch({
        type: "TASK_STARTED",
        payload: {
          taskId: task.id,
          startedAt,
          etaSeconds: etaForTask(task, meta.totalDurationSeconds),
        },
      });
    });
  }

  function tickRunningTasks(state: QueueState): void {
    const running = getRunningTasks(state.tasks);
    const now = Date.now();

    running.forEach((task) => {
      const meta = getOrCreateMeta(task, runtimeMetaMap);

      const tickSeconds = tickIntervalMs / 1000;
      const perSecondProgress = 100 / meta.totalDurationSeconds;
      const delta = perSecondProgress * tickSeconds * randomBetween(0.85, 1.25);
      const nextProgress = Math.min(100, task.progress + delta);
      const nextEta = Math.max(
        0,
        Math.ceil(((100 - nextProgress) / 100) * meta.totalDurationSeconds),
      );

      if (meta.shouldFail && nextProgress >= meta.failAtProgress) {
        options.dispatch({
          type: "TASK_FAILED",
          payload: {
            taskId: task.id,
            completedAt: now,
            errorMessage: meta.failMessage,
          },
        });
        runtimeMetaMap.delete(task.id);
        return;
      }

      if (nextProgress >= 100) {
        options.dispatch({
          type: "TASK_DONE",
          payload: {
            taskId: task.id,
            completedAt: now,
            outputUrl: "#",
          },
        });
        runtimeMetaMap.delete(task.id);
        return;
      }

      options.dispatch({
        type: "TASK_PROGRESS_UPDATED",
        payload: {
          taskId: task.id,
          progress: nextProgress,
          etaSeconds: nextEta,
        },
      });
    });
  }

  function cleanupMeta(state: QueueState): void {
    const activeIds = new Set(state.tasks.filter(isActiveTask).map((task) => task.id));
    runtimeMetaMap.forEach((_, taskId) => {
      if (!activeIds.has(taskId)) runtimeMetaMap.delete(taskId);
    });
  }

  return {
    start() {
      if (intervalId) return;

      intervalId = setInterval(() => {
        const state = options.getState();
        if (state.loadState !== "ready") return;

        tickRunningTasks(state);
        syncRunningSlots(options.getState());
        cleanupMeta(options.getState());
      }, tickIntervalMs);
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      runtimeMetaMap.clear();
    },
  };
}
