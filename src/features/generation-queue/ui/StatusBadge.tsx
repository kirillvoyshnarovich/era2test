import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  queued: {
    label: "В очереди",
    className: "bg-secondary text-muted-foreground",
  },
  running: {
    label: "Идёт",
    className: "bg-primary/15 text-primary",
  },
  done: {
    label: "Готово",
    className: "bg-emerald-500/15 text-emerald-400",
  },
  failed: {
    label: "Ошибка",
    className: "bg-destructive/15 text-destructive",
  },
  canceled: {
    label: "Отменено",
    className: "bg-muted/50 bg-[#1A1514] text-muted-foreground",
  },
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm px-2.5 py-1",
        "font-mono text-[11px] font-semibold uppercase tracking-[0.08em]",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
