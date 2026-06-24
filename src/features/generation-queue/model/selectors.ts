import type { GenerationTask, TaskStatus } from "@/entities/generation-task";
import type { QueueFilterStatus, QueueFilterType, QueueSort, QueueState } from "./queueReducer";

export interface QueueStats {
  queued: number;
  running: number;
  done: number;
  failed: number;
}

export function selectQueueStats(tasks: GenerationTask[]): QueueStats {
  return tasks.reduce<QueueStats>(
    (acc, task) => {
      if (task.status === "queued") acc.queued += 1;
      if (task.status === "running") acc.running += 1;
      if (task.status === "done") acc.done += 1;
      if (task.status === "failed") acc.failed += 1;
      return acc;
    },
    { queued: 0, running: 0, done: 0, failed: 0 },
  );
}

export function selectActiveCount(tasks: GenerationTask[]): number {
  return tasks.filter((task) => task.status === "queued" || task.status === "running").length;
}

export function selectAverageActiveProgress(tasks: GenerationTask[]): number {
  const active = tasks.filter((task) => task.status === "queued" || task.status === "running");
  if (active.length === 0) return 0;
  const sum = active.reduce((acc, task) => acc + task.progress, 0);
  return Math.round(sum / active.length);
}

function byCreatedAt(sort: QueueSort) {
  return (a: GenerationTask, b: GenerationTask): number => {
    if (sort === "oldest") return a.createdAt - b.createdAt;
    return b.createdAt - a.createdAt;
  };
}

function includesSearch(task: GenerationTask, query: string): boolean {
  if (!query) return true;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    task.prompt.toLowerCase().includes(normalized) ||
    task.model.toLowerCase().includes(normalized) ||
    task.type.toLowerCase().includes(normalized)
  );
}

function matchesStatus(task: GenerationTask, status: QueueFilterStatus): boolean {
  return status === "all" ? true : task.status === status;
}

function matchesType(task: GenerationTask, type: QueueFilterType): boolean {
  return type === "all" ? true : task.type === type;
}

export function selectVisibleTasks(
  tasks: GenerationTask[],
  options: {
    status: QueueFilterStatus;
    type: QueueFilterType;
    search: string;
    sort: QueueSort;
  },
): GenerationTask[] {
  return tasks
    .filter((task) => matchesStatus(task, options.status))
    .filter((task) => matchesType(task, options.type))
    .filter((task) => includesSearch(task, options.search))
    .sort(byCreatedAt(options.sort));
}

export function selectQueuePosition(tasks: GenerationTask[], taskId: string): number | null {
  const queued = tasks
    .filter((task) => task.status === "queued")
    .sort((a, b) => a.createdAt - b.createdAt);
  const index = queued.findIndex((task) => task.id === taskId);
  return index === -1 ? null : index + 1;
}

export function selectTasksByStatus(tasks: GenerationTask[], status: TaskStatus): GenerationTask[] {
  return tasks.filter((task) => task.status === status);
}

export function selectFromState(state: QueueState) {
  const visibleTasks = selectVisibleTasks(state.tasks, state.ui);
  return {
    ...state,
    visibleTasks,
    stats: selectQueueStats(state.tasks),
    activeCount: selectActiveCount(state.tasks),
    averageActiveProgress: selectAverageActiveProgress(state.tasks),
  };
}
