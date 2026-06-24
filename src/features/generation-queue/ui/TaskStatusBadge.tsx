import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  queued: {
    label: "В очереди",
    className: "bg-secondary text-muted-foreground border-border",
  },
  running: {
    label: "Идёт",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  done: {
    label: "Готово",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  failed: {
    label: "Ошибка",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  canceled: {
    label: "Отменено",
    className: "bg-muted/50 text-muted-foreground border-border",
  },
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1",
        "font-mono text-[11px] font-semibold uppercase tracking-[0.08em]",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
