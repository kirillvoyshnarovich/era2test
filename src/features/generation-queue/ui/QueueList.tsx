import { Inbox } from "lucide-react";
import { selectQueuePosition } from "../model/selectors";
import { useQueue } from "../model/useQueue";
import { Skeleton } from "@/shared/ui/skeleton";
import { QueueTask } from "./QueueTask";

function QueueTaskSkeleton() {
  return (
    <div className="rounded-[14px] border border-border bg-card/60 p-4">
      <div className="flex gap-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-[10px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function QueueList() {
  const {
    tasks,
    visibleTasks,
    loadState,
    loadError,
    cancelTask,
    retryTask,
    deleteTask,
    reload,
    ui,
  } = useQueue();

  const isLoading = loadState === "loading" || loadState === "idle";
  const isError = loadState === "error";
  const isEmpty = !isLoading && !isError && visibleTasks.length === 0;

  const handleDownload = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task?.outputUrl) return;
    window.open(task.outputUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Загрузка списка задач">
        {Array.from({ length: 4 }).map((_, index) => (
          <QueueTaskSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
        <p className="text-sm text-destructive">{loadError ?? "Не удалось загрузить очередь"}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (isEmpty) {
    const hasFilters =
      ui.status !== "all" || ui.type !== "all" || ui.search.trim().length > 0;

    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-border bg-card/40 px-6 py-16 text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
          style={{
            background: "rgba(232,84,32,0.08)",
            borderColor: "rgba(232,84,32,0.2)",
            color: "hsl(var(--primary))",
          }}
        >
          <Inbox className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {hasFilters ? "Ничего не найдено" : "Очередь пуста"}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {hasFilters
            ? "Попробуйте изменить фильтры или поисковый запрос."
            : "Здесь появятся задачи после отправки на генерацию."}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Список задач генерации">
      {visibleTasks.map((task) => (
        <li key={task.id}>
          <QueueTask
            task={task}
            queuePosition={selectQueuePosition(tasks, task.id)}
            onCancel={cancelTask}
            onRetry={retryTask}
            onDelete={deleteTask}
            onDownload={handleDownload}
          />
        </li>
      ))}
    </ul>
  );
}
