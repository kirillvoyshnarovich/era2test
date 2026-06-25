import { useEffect, useState } from "react";

const PROGRESS_DISPLAY_DELAY_MS = 320;

export function useSmoothedProgress(value: number): number {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDisplayValue(Math.round(value / 5) * 5);
    }, PROGRESS_DISPLAY_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [value]);

  return displayValue;
}
