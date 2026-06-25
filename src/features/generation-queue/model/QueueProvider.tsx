import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GenerationTask, TaskStatus } from "@/entities/generation-task";
import { QUEUE_SEED } from "@/entities/generation-task";
import { createQueueEngine } from "./queueEngine";
import {
  initialQueueState,
  queueReducer,
  type QueueFilterStatus,
  type QueueFilterType,
  type QueueSort,
} from "./queueReducer";
import { selectFromState } from "./selectors";

const QUEUE_STORAGE_KEY = "era2_generation_queue_v1";
const SEARCH_DEBOUNCE_MS = 300;

interface QueueActions {
  retryTask: (taskId: string) => void;
  cancelTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearDone: () => void;
  setStatusFilter: (status: QueueFilterStatus) => void;
  setTypeFilter: (type: QueueFilterType) => void;
  setSort: (sort: QueueSort) => void;
  setSearch: (search: string) => void;
  reload: () => void;
}

export type QueueContextValue = ReturnType<typeof selectFromState> & QueueActions;

export const QueueContext = createContext<QueueContextValue | null>(null);

function parseStoredTasks(raw: string | null): GenerationTask[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as GenerationTask[];
  } catch {
    return null;
  }
}

function canCancel(status: TaskStatus): boolean {
  return status === "queued" || status === "running";
}

function canRetry(status: TaskStatus): boolean {
  return status === "failed" || status === "canceled";
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialQueueState);
  const stateRef = useRef(state);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    dispatch({ type: "INIT_START" });

    const timerId = setTimeout(() => {
      // Simulated flaky first-load behavior for Loading/Error states.
      if (Math.random() < 0.08) {
        dispatch({ type: "INIT_ERROR", payload: "Не удалось загрузить очередь. Попробуйте снова." });
        return;
      }

      const restored = parseStoredTasks(localStorage.getItem(QUEUE_STORAGE_KEY));
      dispatch({
        type: "INIT_SUCCESS",
        payload: restored ?? QUEUE_SEED,
      });
    }, 600);

    return () => clearTimeout(timerId);
  }, [reloadToken]);

  useEffect(() => {
    if (state.loadState !== "ready") return;
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(state.tasks));
  }, [state.loadState, state.tasks]);

  useEffect(() => {
    const engine = createQueueEngine({
      getState: () => stateRef.current,
      dispatch,
    });
    engine.start();
    return () => engine.stop();
  }, []);

  const retryTask = useCallback((taskId: string) => {
    const task = stateRef.current.tasks.find((item) => item.id === taskId);
    if (!task || !canRetry(task.status)) return;
    dispatch({ type: "TASK_RETRIED", payload: { taskId, now: Date.now() } });
  }, []);

  const cancelTask = useCallback((taskId: string) => {
    const task = stateRef.current.tasks.find((item) => item.id === taskId);
    if (!task || !canCancel(task.status)) return;
    dispatch({ type: "TASK_CANCELED", payload: { taskId, completedAt: Date.now() } });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: "TASK_DELETED", payload: { taskId } });
  }, []);

  const clearDone = useCallback(() => {
    dispatch({ type: "CLEAR_DONE" });
  }, []);

  const setStatusFilter = useCallback((status: QueueFilterStatus) => {
    dispatch({ type: "SET_STATUS_FILTER", payload: status });
  }, []);

  const setTypeFilter = useCallback((type: QueueFilterType) => {
    dispatch({ type: "SET_TYPE_FILTER", payload: type });
  }, []);

  const setSort = useCallback((sort: QueueSort) => {
    dispatch({ type: "SET_SORT", payload: sort });
  }, []);

  const setSearch = useCallback((search: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch({ type: "SET_SEARCH", payload: search });
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const reload = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  const derived = useMemo(() => selectFromState(state), [state]);

  const value = useMemo<QueueContextValue>(
    () => ({
      ...derived,
      retryTask,
      cancelTask,
      deleteTask,
      clearDone,
      setStatusFilter,
      setTypeFilter,
      setSort,
      setSearch,
      reload,
    }),
    [
      derived,
      retryTask,
      cancelTask,
      deleteTask,
      clearDone,
      setStatusFilter,
      setTypeFilter,
      setSort,
      setSearch,
      reload,
    ],
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}
