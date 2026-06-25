import { useEffect, useState } from "react";
import { Progress } from "@/shared/ui/progress";

export function LoadingState() {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setProgress((current) => (current >= 92 ? 12 : current + 10));
    }, 180);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center rounded-[14px] border border-border bg-card/40 px-6 py-20 text-center"
      aria-busy="true"
      aria-label="Загрузка очереди"
    >
      <div className="w-full max-w-[280px]">
        <Progress value={progress} className="h-2" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Загружаем очередь генераций…</p>
    </div>
  );
}
