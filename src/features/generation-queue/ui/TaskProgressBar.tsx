import { cn } from "@/shared/lib/utils";
import { formatProgress } from "../lib/formatEta";

interface TaskProgressBarProps {
  progress: number;
  className?: string;
}

export function TaskProgressBar({ progress, className }: TaskProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-primary/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="shrink-0 font-mono text-[12px] font-medium tabular-nums text-primary">
        {formatProgress(clamped)}
      </span>
    </div>
  );
}
