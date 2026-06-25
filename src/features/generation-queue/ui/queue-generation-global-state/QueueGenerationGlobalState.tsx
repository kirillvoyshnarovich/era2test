import { useMemo, useState } from "react";
import { useNavigate } from "@/shared/routing";
import { cn } from "@/shared/lib/utils";
import { selectActiveTasks } from "../../model/selectors";
import { useQueue } from "../../model/useQueue";
import { MultipleActiveView } from "./MultipleActiveView";
import { SingleActiveView } from "./SingleActiveView";
import { StatusBarShell } from "./StatusBarShell";
import { useSmoothedProgress } from "../../lib/useSmoothedProgress";

export function QueueGenerationGlobalState() {
  const navigate = useNavigate();
  const { tasks, activeCount, averageActiveProgress, loadState } = useQueue();
  const smoothedAverage = useSmoothedProgress(averageActiveProgress);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeTasks = useMemo(() => selectActiveTasks(tasks, 3), [tasks]);
  const runningCount = useMemo(
    () => tasks.filter((task) => task.status === "running").length,
    [tasks],
  );
  const isVisible = loadState === "ready" && activeCount > 0;
  const isSingle = runningCount === 1;

  const openQueue = () => {
    if (!isSingle && isCollapsed) {
      setIsCollapsed(false);
      return;
    }
    navigate("/queue");
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50 transition-all duration-300 ease-out",
        "max-[480px]:inset-x-0 max-[480px]:bottom-[calc(24px+env(safe-area-inset-bottom))] max-[480px]:mx-auto max-[480px]:w-[90%]",
        "min-[481px]:bottom-6 min-[481px]:right-6 min-[481px]:w-auto",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0 max-[480px]:translate-y-full",
      )}
      aria-hidden={!isVisible}
    >
      <StatusBarShell
        onClick={isVisible ? openQueue : undefined}
        className={cn(
          "pointer-events-auto w-full transition-transform",
          !isVisible && "pointer-events-none",
        )}
      >
        {isSingle && activeTasks[0] ? (
          <SingleActiveView task={activeTasks[0]} />
        ) : (
          <MultipleActiveView
            tasks={activeTasks}
            activeCount={activeCount}
            averageProgress={smoothedAverage}
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setIsCollapsed((value) => !value)}
          />
        )}
      </StatusBarShell>
    </div>
  );
}
