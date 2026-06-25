import { cn } from "@/shared/lib/utils";
import { createTaskHandlers, TaskItemProps, TaskMeta, TaskPreview } from "../lib/taskPresentation";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";
import { formatProgress } from "../lib/formatEta";

export type TaskRowProps = TaskItemProps;

export function TaskRow(props: TaskRowProps) {
  const { task, queuePosition } = props;
  const handlers = createTaskHandlers(task, props);
  const clamped = Math.min(100, Math.max(0, task.progress));

  return (
    <article
      className={cn(
        "rounded-[14px] border border-border bg-card/80 p-4 transition-colors",
        "hover:border-primary/20 hover:bg-card",
      )}
      aria-label={`Задача: ${task.prompt}`}
    >
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4">
        <TaskPreview task={task} />
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-1 text-[15px] font-medium leading-snug text-foreground"
            title={task.prompt}
          >
            {task.prompt}
          </p>
          <TaskMeta task={task} queuePosition={queuePosition} />
          {task.status === "failed" && task.errorMessage && (
            <p className="mt-2 text-[13px] leading-snug text-destructive">{task.errorMessage}</p>
          )}
        </div>
        {
          clamped > 0 && clamped < 100 && (<span className="shrink-0 font-mono text-[12px] font-medium tabular-nums text-primary">
            {formatProgress(clamped)}
          </span>)
        }
        <StatusBadge status={task.status} />
        <TaskActions status={task.status} {...handlers}/>
      </div>

      {task.status === "running" && (
        <div className="mt-3 pl-[72px]">
          <ProgressBar progress={task.progress} showLabel={false} />
        </div>
      )}
    </article>
  );
}
