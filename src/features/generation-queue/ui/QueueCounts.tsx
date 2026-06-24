import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";
import type { QueueStats } from "../model/selectors";
import { useQueue } from "../model/useQueue";

type StatKey = keyof QueueStats;

interface CountItemConfig {
  key: StatKey;
  label: string;
  icon: LucideIcon;
  cardClass: string;
  iconWrapClass: string;
  valueClass: string;
}

const COUNT_ITEMS: CountItemConfig[] = [
  {
    key: "queued",
    label: "В очереди",
    icon: Clock,
    cardClass: "border-border bg-card",
    iconWrapClass: "bg-secondary text-muted-foreground",
    valueClass: "text-foreground",
  },
  {
    key: "running",
    label: "Идёт",
    icon: Loader2,
    cardClass: "border-primary/25 bg-primary/[0.06]",
    iconWrapClass: "bg-primary/15 text-primary",
    valueClass: "text-primary",
  },
  {
    key: "done",
    label: "Готово",
    icon: CheckCircle2,
    cardClass: "border-emerald-500/25 bg-emerald-500/[0.06]",
    iconWrapClass: "bg-emerald-500/15 text-emerald-400",
    valueClass: "text-emerald-400",
  },
  {
    key: "failed",
    label: "Ошибка",
    icon: AlertCircle,
    cardClass: "border-destructive/25 bg-destructive/[0.06]",
    iconWrapClass: "bg-destructive/15 text-destructive",
    valueClass: "text-destructive",
  },
];

interface CountCardProps {
  item: CountItemConfig;
  value: number;
  isLoading: boolean;
}

function CountCard({ item, value, isLoading }: CountCardProps) {
  const Icon = item.icon;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-[14px] border p-4 transition-colors duration-300 md:p-5",
        item.cardClass,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">{item.label}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]",
            item.iconWrapClass,
          )}
        >
          <Icon
            className={cn("h-4 w-4", item.key === "running" && value > 0 && "animate-spin")}
            strokeWidth={1.8}
          />
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="h-9 w-16 rounded-lg" />
      ) : (
        <p
          className={cn(
            "font-mono text-[32px] font-semibold leading-none tracking-tight tabular-nums",
            item.valueClass,
          )}
        >
          {value}
        </p>
      )}
    </article>
  );
}

export function QueueCounts() {
  const { stats, loadState } = useQueue();
  const isLoading = loadState === "loading" || loadState === "idle";

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
      aria-label="Сводка по очереди генераций"
    >
      {COUNT_ITEMS.map((item) => (
        <CountCard
          key={item.key}
          item={item}
          value={stats[item.key]}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
