import { ArrowRight, MessageSquare, Image as ImageIcon, Video, Mic } from "lucide-react";
import type { GenerationTask, GenType } from "@/entities/generation-task";
import { Spinner } from "@/shared/ui/spinner";
import { formatProgress } from "../../lib/formatEta";
import { ProgressBar } from "../ProgressBar";

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

export interface SingleActiveViewProps {
  task: GenerationTask;
}

export function SingleActiveView({ task }: SingleActiveViewProps) {
  const TypeIcon = TYPE_ICONS[task.type];
  const clampedProgress = Math.min(100, Math.max(0, task.progress));

  return (
    <div className="flex items-center gap-3.5 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Spinner className="size-6 align-start" />
          <span className="flex flex-col">
            <span className="text-[13px] font-medium text-foreground">{TYPE_LABELS[task.type]}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-flex max-w-[140px] truncate px-1 font-mono text-[11px]">
                {task.model}
              </span>
              ·
              <span className="px-1 text-[11px] font-medium">
                {formatProgress(clampedProgress)}
              </span>
            </span>
          </span>
          <ArrowRight className="ml-auto size-4 justify-self-end text-muted-foreground" />
        </div>
        <div className="grid w-full grid-cols-[auto_1fr] items-center gap-4">
          <TypeIcon className="size-8 text-primary" />
          <div className="align-start flex min-w-0 flex-col gap-2.5">
            <p className="line-clamp-1 text-[12px] text-muted-foreground">{task.prompt}</p>
            <ProgressBar progress={task.progress} />
          </div>
        </div>
      </div>
    </div>
  );
}
