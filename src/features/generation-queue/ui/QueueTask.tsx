import { Mic, MessageSquare, Image as ImageIcon, Video } from "lucide-react";
import type { GenerationTask, GenType } from "@/entities/generation-task";
import { ModelGlyph, CreditTag } from "@/shared/ui/era/ModelGlyph";
import { cn } from "@/shared/lib/utils";
import { formatEta } from "../lib/formatEta";
import { TaskActions } from "./TaskActions";
import { TaskProgressBar } from "./TaskProgressBar";
import { TaskStatusBadge } from "./TaskStatusBadge";

const TYPE_LABELS: Record<GenType, string> = {
  text: "Текст",
  image: "Изображение",
  video: "Видео",
  audio: "Аудио",
};

const TYPE_ICONS: Record<GenType, typeof MessageSquare> = {
  text: MessageSquare,
  image: ImageIcon,
  video: Video,
  audio: Mic,
};

export interface QueueTaskProps {
  task: GenerationTask;
  queuePosition: number | null;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onDownload: (taskId: string) => void;
}

function TaskPreview({ task, className }: { task: GenerationTask; className?: string }) {
  const isMedia = task.type === "image" || task.type === "video";
  const TypeIcon = TYPE_ICONS[task.type];

  if (isMedia) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border",
          "h-12 w-12 min-[481px]:h-14 min-[481px]:w-14",
          task.type === "image" ? "era-ph-coal" : "era-ph-ember",
          className,
        )}
        aria-hidden
      >
        <TypeIcon className="h-5 w-5 text-primary/70" strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <ModelGlyph
      name={task.model}
      size={48}
      className={cn("min-[481px]:!h-14 min-[481px]:!w-14", className)}
    />
  );
}

function TaskMeta({ task, queuePosition }: { task: GenerationTask; queuePosition: number | null }) {
  const showEta =
    (task.status === "queued" || task.status === "running") && task.etaSeconds > 0;
  const showDuration =
    task.status === "done" && task.completedAt && task.startedAt;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-center rounded-full border border-border bg-secondary/80 px-2.5 py-0.5 font-mono text-[11px] font-medium text-foreground">
        {task.model}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {TYPE_LABELS[task.type]}
      </span>
      {task.status === "queued" && queuePosition !== null && (
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          · #{queuePosition} в очереди
        </span>
      )}
      {showEta && (
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          · ETA {formatEta(task.etaSeconds)}
        </span>
      )}
      {showDuration && (
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          ·{" "}
          {formatEta(
            Math.max(1, Math.round((task.completedAt! - task.startedAt!) / 1000)),
          )}
        </span>
      )}
      <span className="text-muted-foreground">·</span>
      <CreditTag value={task.credits} />
    </div>
  );
}

function TaskBody({
  task,
  queuePosition,
}: Pick<QueueTaskProps, "task" | "queuePosition">) {
  return (
    <div className="min-w-0 flex-1">
      <p
        className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground min-[481px]:line-clamp-1 min-[481px]:text-[15px]"
        title={task.prompt}
      >
        {task.prompt}
      </p>
      <TaskMeta task={task} queuePosition={queuePosition} />
      {task.status === "failed" && task.errorMessage && (
        <p className="mt-2 text-[13px] leading-snug text-destructive">{task.errorMessage}</p>
      )}
    </div>
  );
}

export function QueueTask({
  task,
  queuePosition,
  onCancel,
  onRetry,
  onDelete,
  onDownload,
}: QueueTaskProps) {
  const handlers = {
    onCancel: () => onCancel(task.id),
    onRetry: () => onRetry(task.id),
    onDelete: () => onDelete(task.id),
    onDownload: () => onDownload(task.id),
  };

  return (
    <article
      className={cn(
        "rounded-[14px] border border-border bg-card/80 p-4 transition-colors",
        "hover:border-primary/20 hover:bg-card",
      )}
      aria-label={`Задача: ${task.prompt}`}
    >
      {/* Mobile card layout (≤480px) */}
      <div className="flex flex-col gap-3 min-[481px]:hidden">
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
              <TaskStatusBadge status={task.status} />
            </div>
            <TaskMeta task={task} queuePosition={queuePosition} />
          </div>
        </div>

        {task.status === "failed" && task.errorMessage && (
          <p className="text-[13px] leading-snug text-destructive">{task.errorMessage}</p>
        )}

        {task.status === "running" && <TaskProgressBar progress={task.progress} />}

        <TaskActions status={task.status} {...handlers} className="justify-end" />
      </div>

      {/* Desktop / tablet row layout (≥481px) */}
      <div className="hidden min-[481px]:block">
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4">
          <TaskPreview task={task} />
          <TaskBody task={task} queuePosition={queuePosition} />
          <TaskStatusBadge status={task.status} />
          <TaskActions status={task.status} {...handlers} />
        </div>

        {task.status === "running" && (
          <div className="mt-3 pl-[72px]">
            <TaskProgressBar progress={task.progress} />
          </div>
        )}
      </div>
    </article>
  );
}
