import { cn } from "@/shared/lib/utils";
import { formatProgress } from "../lib/formatEta";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ progress, className, showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  console.log('ProgressBar clamped', clamped);
  return (
    <div className={cn("flex min-w-0 items-center gap-3 PROGRESS-BAR", className)}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-primary/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (<span className="shrink-0 font-mono text-[12px] font-medium tabular-nums text-primary">
        {formatProgress(clamped)}
      </span>)}
    </div>
  );
}
