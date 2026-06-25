import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";
import type { QueueStats as QueueStatsData } from "../model/selectors";
import { useQueue } from "../model/useQueue";

type StatKey = keyof QueueStatsData;

interface StatItemConfig {
  key: StatKey;
  label: string;
  iconWrapClass: string;
  valueClass: string;
}

const STAT_ITEMS: StatItemConfig[] = [
  {
    key: "queued",
    label: "В очереди",
    iconWrapClass: "bg-secondary text-muted-foreground",
    valueClass: "bg-[var(--c-fg-mute)]",
  },
  {
    key: "running",
    label: "Идёт",
    iconWrapClass: "bg-primary/15 text-primary",
    valueClass: "bg-[var(--c-accent)]",
  },
  {
    key: "done",
    label: "Готово",
    iconWrapClass: "bg-emerald-500/15 text-emerald-400",
    valueClass: "bg-[var(--c-accent-done)]",
  },
  {
    key: "failed",
    label: "Ошибка",
    iconWrapClass: "bg-destructive/15 text-destructive",
    valueClass: "bg-[var(--c-accent-failed)]",
  },
];

export function QueueStats() {
  const { stats, loadState } = useQueue();
  const isLoading = loadState === "loading" || loadState === "idle";

  return (
    <div
      className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
      aria-label="Сводка по очереди генераций"
    >
      {STAT_ITEMS.map((item) => {
        const value = stats[item.key];

        return (
          <article
            key={item.key}
            className="flex flex-col gap-3 rounded-[14px] border p-4 transition-colors duration-300 md:p-5 bg-[var(--bg-secondary)]"
          >
            <div className="flex items-center justify-start gap-2">
              <span className={cn("size-2 rounded-full", item.valueClass)} aria-hidden />
              <span className="text-[13px] font-medium text-muted-foreground">{item.label}</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-9 w-16 rounded-lg" />
            ) : (
              <p
                className={"font-mono text-[32px] font-semibold leading-none tracking-tight tabular-nums"}
              >
                {value}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
