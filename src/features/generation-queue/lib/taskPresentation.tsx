import { Mic, MessageSquare, Image as ImageIcon, Video } from "lucide-react";
import type { GenerationTask, GenType } from "@/entities/generation-task";
import { ModelGlyph, CreditTag } from "@/shared/ui/era/ModelGlyph";
import { cn } from "@/shared/lib/utils";
import { formatEta } from "./formatEta";

export const TYPE_LABELS: Record<GenType, string> = {
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

export interface TaskItemProps {
  task: GenerationTask;
  queuePosition: number | null;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onDownload: (taskId: string) => void;
}

export function createTaskHandlers(task: GenerationTask, props: TaskItemProps) {
  return {
    onCancel: () => props.onCancel(task.id),
    onRetry: () => props.onRetry(task.id),
    onDelete: () => props.onDelete(task.id),
    onDownload: () => props.onDownload(task.id),
  };
}

export function TaskPreview({ task, className }: { task: GenerationTask; className?: string }) {
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

export function TaskMeta({ task, queuePosition }: { task: GenerationTask; queuePosition: number | null }) {
  const showEta =
    (task.status === "queued" || task.status === "running") && task.etaSeconds > 0;
  const showDuration =
    task.status === "done" && task.completedAt && task.startedAt;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[11px] font-medium text-[var(--text-secondary)]">
        <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
        {task.model}
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
      <span className="text-muted-foreground font-mono text-[11px]">
        {task.credits} cr
      </span>
    </div>
  );
}
