import { Button } from "@/shared/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  QueueStats,
  QueueToolbar,
  selectQueuePosition,
  TaskCard,
  TaskRow,
  useQueue,
} from "@/features/generation-queue";

export function GenerationQueue() {
  const {
    stats,
    clearDone,
    tasks,
    visibleTasks,
    loadState,
    cancelTask,
    retryTask,
    deleteTask,
    reload,
    ui,
  } = useQueue();

  const doneCount = stats.done;
  const isLoading = loadState === "loading" || loadState === "idle";
  const isError = loadState === "error";
  const isEmpty = !isLoading && !isError && visibleTasks.length === 0;
  const hasFilters =
    ui.status !== "all" || ui.type !== "all" || ui.search.trim().length > 0;

  const handleClearDone = () => {
    if (doneCount === 0) return;
    const confirmed = window.confirm(
      `Удалить готовые генерации (${doneCount})? Это действие нельзя отменить.`,
    );
    if (confirmed) clearDone();
  };

  const handleDownload = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task?.outputUrl) return;
    window.open(task.outputUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="min-h-[calc(100vh-var(--header-height,64px))]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 md:py-8">
        <header className="flex md:flex-row gap-4 p-5 md:p-6 pl-0 md:pl-0 lg:flex-row md:items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Очередь генераций
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Все ваши задачи в реальном времени
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="default"
            disabled={doneCount === 0}
            onClick={handleClearDone}
            className="text-[var(--text-secondary)] cursor-pointer"
          >
            Очистить готовые
          </Button>
        </header>

        <QueueStats />
        <QueueToolbar />

        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={reload} />}
        {isEmpty && <EmptyState hasFilters={hasFilters} />}

        {!isLoading && !isError && !isEmpty && (
          <ul className="flex flex-col gap-3" aria-label="Список задач генерации">
            {visibleTasks.map((task) => {
              const taskProps = {
                task,
                queuePosition: selectQueuePosition(tasks, task.id),
                onCancel: cancelTask,
                onRetry: retryTask,
                onDelete: deleteTask,
                onDownload: handleDownload,
              };

              return (
                <li key={task.id}>
                  <div className="min-[481px]:hidden">
                    <TaskCard {...taskProps} />
                  </div>
                  <div className="hidden min-[481px]:block">
                    <TaskRow {...taskProps} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
