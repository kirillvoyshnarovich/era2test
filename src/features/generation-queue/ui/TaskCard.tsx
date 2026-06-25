import { cn } from "@/shared/lib/utils";
import { createTaskHandlers, TaskItemProps, TaskMeta, TaskPreview } from "../lib/taskPresentation";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";

export type TaskCardProps = TaskItemProps;

export function TaskCard(props: TaskCardProps) {
  const { task, queuePosition } = props;
  const handlers = createTaskHandlers(task, props);

  return (
    <article
      className={cn(
        "rounded-[14px] border border-border bg-card/80 p-4 transition-colors",
        "hover:border-primary/20 hover:bg-card",
      )}
      aria-label={`Задача: ${task.prompt}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <TaskPreview task={task} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p
                className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground"
                title={task.prompt}
              >
                {task.prompt}
              </p>
            </div>
            <TaskMeta task={task} queuePosition={queuePosition} />
          </div>
        </div>

        {task.status === "failed" && task.errorMessage && (
          <p className="text-[13px] leading-snug text-destructive">{task.errorMessage}</p>
        )}
        {task.status === "running" && <ProgressBar progress={task.progress} />}
        <div className="flex flex-row items-center justify-between gap-2">
          <StatusBadge status={task.status} />
          <TaskActions status={task.status} {...handlers} className="justify-end" />
        </div>
      </div>
    </article>
  );
}
