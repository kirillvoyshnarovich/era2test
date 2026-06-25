import { ArrowRight, ChevronDown } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task";
import { Link } from "@/shared/routing";
import { Spinner } from "@/shared/ui/spinner";
import { formatProgress } from "../../lib/formatEta";
import { ModelGlyph } from "@/shared/ui/era/ModelGlyph";
import { ProgressBar } from "../ProgressBar";

export interface MultipleActiveViewProps {
  tasks: GenerationTask[];
  activeCount: number;
  averageProgress: number;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

export function MultipleActiveView({
  tasks,
  activeCount,
  averageProgress,
  isCollapsed,
  onToggleCollapsed,
}: MultipleActiveViewProps) {
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Spinner className="size-4" />
          <span className="truncate text-sm font-medium text-foreground">
            {activeCount} генераций ·
            <span className="text-orange-500">&nbsp;{formatProgress(averageProgress)}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full min-[481px]:max-w-[340px]">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Spinner className="size-6" />
            <p className="text-sm font-medium text-foreground">
              Генерации идут
              <span className="flex items-center gap-2 text-muted-foreground">
                {activeCount} активны ·{" "}
                <span className="font-mono tabular-nums">{formatProgress(averageProgress)}</span>
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleCollapsed();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Свернуть статус генераций"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 divide-y divide-border/80 border-y border-border/60 px-4 pb-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex min-w-0 items-center gap-3 py-2">
            <ModelGlyph name={task.model} size={36} />
            <div className="min-w-0 flex-1">
              <div className="shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {task.prompt}
              </div>
              <ProgressBar progress={task.progress} showLabel />
            </div>
          </div>
        ))}
      </div>

      <div className="w-full border-t border-border/60 px-4 py-3">
        <Link
          to="/queue"
          className="inline-flex w-full items-center justify-center gap-1.5 border-border text-[13px] font-medium text-primary hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          Открыть очередь
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
