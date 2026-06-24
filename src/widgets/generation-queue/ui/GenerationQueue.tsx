import { Button } from "@/shared/ui/button";
import { QueueCounts, QueueFilters, QueueList, QueueProvider, useQueue } from "@/features/generation-queue";

function QueueScreenHeader() {
  const { stats, clearDone } = useQueue();
  const doneCount = stats.done;

  const handleClearDone = () => {
    if (doneCount === 0) return;
    const confirmed = window.confirm(
      `Удалить готовые генерации (${doneCount})? Это действие нельзя отменить.`,
    );
    if (confirmed) clearDone();
  };

  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Очередь генераций
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Отслеживайте прогресс задач и управляйте генерациями в реальном времени.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={doneCount === 0}
        onClick={handleClearDone}
        className="w-full lg:w-auto"
      >
        Очистить готовые
      </Button>
    </header>
  );
}

function GenerationQueueContent() {
  return (
    <section className="min-h-[calc(100vh-var(--header-height,64px))]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 md:gap-8 md:py-8">
        <QueueScreenHeader />
        <QueueCounts />
        <QueueFilters />
        <QueueList />
      </div>
    </section>
  );
}

export function GenerationQueue() {
  return (
    <QueueProvider>
      <GenerationQueueContent />
    </QueueProvider>
  );
}
