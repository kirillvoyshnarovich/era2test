import type { GenerationTask, GenType, TaskStatus } from "@/entities/generation-task";

export type QueueSort = "newest" | "oldest";
export type QueueFilterStatus = "all" | TaskStatus;
export type QueueFilterType = "all" | GenType;
export type QueueLoadState = "idle" | "loading" | "ready" | "error";

export interface QueueUiState {
  status: QueueFilterStatus;
  type: QueueFilterType;
  search: string;
  sort: QueueSort;
}

export interface QueueState {
  tasks: GenerationTask[];
  ui: QueueUiState;
  loadState: QueueLoadState;
  loadError: string | null;
}

const defaultUiState: QueueUiState = {
  status: "all",
  type: "all",
  search: "",
  sort: "newest",
};

export const initialQueueState: QueueState = {
  tasks: [],
  ui: defaultUiState,
  loadState: "idle",
  loadError: null,
};

export type QueueAction =
  | { type: "INIT_START" }
  | { type: "INIT_SUCCESS"; payload: GenerationTask[] }
  | { type: "INIT_ERROR"; payload: string }
  | { type: "TASK_ENQUEUED"; payload: GenerationTask }
  | { type: "TASK_STARTED"; payload: { taskId: string; startedAt: number; etaSeconds: number } }
  | { type: "TASK_PROGRESS_UPDATED"; payload: { taskId: string; progress: number; etaSeconds: number } }
  | { type: "TASK_DONE"; payload: { taskId: string; completedAt: number; outputUrl?: string } }
  | { type: "TASK_FAILED"; payload: { taskId: string; completedAt: number; errorMessage: string } }
  | { type: "TASK_CANCELED"; payload: { taskId: string; completedAt: number } }
  | { type: "TASK_RETRIED"; payload: { taskId: string; now: number } }
  | { type: "TASK_DELETED"; payload: { taskId: string } }
  | { type: "CLEAR_DONE" }
  | { type: "SET_STATUS_FILTER"; payload: QueueFilterStatus }
  | { type: "SET_TYPE_FILTER"; payload: QueueFilterType }
  | { type: "SET_SORT"; payload: QueueSort }
  | { type: "SET_SEARCH"; payload: string };

function clampProgress(progress: number): number {
  if (progress < 0) return 0;
  if (progress > 100) return 100;
  return progress;
}

function sanitizeTask(task: GenerationTask): GenerationTask {
  if (task.status === "running") {
    return {
      ...task,
      // After reload we requeue running tasks and let engine restart them consistently.
      status: "queued",
      progress: task.progress >= 100 ? 99 : clampProgress(task.progress),
      startedAt: undefined,
      completedAt: undefined,
      errorMessage: undefined,
      etaSeconds: task.etaSeconds > 0 ? task.etaSeconds : 1,
    };
  }

  if (task.status === "queued") {
    return {
      ...task,
      progress: clampProgress(task.progress >= 100 ? 99 : task.progress),
      completedAt: undefined,
      errorMessage: undefined,
    };
  }

  if (task.status === "done") {
    return {
      ...task,
      progress: 100,
      etaSeconds: 0,
      errorMessage: undefined,
    };
  }

  return {
    ...task,
    progress: clampProgress(task.progress),
    etaSeconds: 0,
  };
}

function updateTask(
  tasks: GenerationTask[],
  taskId: string,
  updater: (task: GenerationTask) => GenerationTask,
): GenerationTask[] {
  return tasks.map((task) => (task.id === taskId ? updater(task) : task));
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "INIT_START":
      return { ...state, loadState: "loading", loadError: null };
    case "INIT_SUCCESS":
      return {
        ...state,
        tasks: action.payload.map(sanitizeTask),
        loadState: "ready",
        loadError: null,
      };
    case "INIT_ERROR":
      return { ...state, loadState: "error", loadError: action.payload };
    case "TASK_ENQUEUED":
      return { ...state, tasks: [...state.tasks, sanitizeTask(action.payload)] };
    case "TASK_STARTED":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.payload.taskId, (task) => ({
          ...task,
          status: "running",
          startedAt: action.payload.startedAt,
          completedAt: undefined,
          errorMessage: undefined,
          etaSeconds: action.payload.etaSeconds,
        })),
      };
    case "TASK_PROGRESS_UPDATED":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.payload.taskId, (task) => ({
          ...task,
          progress: clampProgress(action.payload.progress),
          etaSeconds: Math.max(0, Math.floor(action.payload.etaSeconds)),
        })),
      };
    case "TASK_DONE":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.payload.taskId, (task) => ({
          ...task,
          status: "done",
          progress: 100,
          etaSeconds: 0,
          completedAt: action.payload.completedAt,
          outputUrl: action.payload.outputUrl ?? task.outputUrl ?? "#",
          errorMessage: undefined,
        })),
      };
    case "TASK_FAILED":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.payload.taskId, (task) => ({
          ...task,
          status: "failed",
          etaSeconds: 0,
          completedAt: action.payload.completedAt,
          errorMessage: action.payload.errorMessage,
        })),
      };
    case "TASK_CANCELED":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.payload.taskId, (task) => ({
          ...task,
          status: "canceled",
          etaSeconds: 0,
          completedAt: action.payload.completedAt,
          errorMessage: undefined,
        })),
      };
    case "TASK_RETRIED":
      return {
        ...state,
        tasks: updateTask(state.tasks, action.payload.taskId, (task) => ({
          ...task,
          status: "queued",
          progress: 0,
          createdAt: action.payload.now,
          startedAt: undefined,
          completedAt: undefined,
          errorMessage: undefined,
          outputUrl: undefined,
          etaSeconds: 1,
        })),
      };
    case "TASK_DELETED":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload.taskId) };
    case "CLEAR_DONE":
      return { ...state, tasks: state.tasks.filter((task) => task.status !== "done") };
    case "SET_STATUS_FILTER":
      return { ...state, ui: { ...state.ui, status: action.payload } };
    case "SET_TYPE_FILTER":
      return { ...state, ui: { ...state.ui, type: action.payload } };
    case "SET_SORT":
      return { ...state, ui: { ...state.ui, sort: action.payload } };
    case "SET_SEARCH":
      return { ...state, ui: { ...state.ui, search: action.payload } };
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}
