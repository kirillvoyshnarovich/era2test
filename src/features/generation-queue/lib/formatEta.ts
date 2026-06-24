export function formatEta(seconds: number): string {
  if (seconds <= 0) return "—";

  if (seconds < 60) {
    return `~${seconds} сек`;
  }

  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  if (minutes < 60) {
    return restSeconds > 0 ? `~${minutes} мин ${restSeconds} сек` : `~${minutes} мин`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes > 0 ? `~${hours} ч ${restMinutes} мин` : `~${hours} ч`;
}

export function formatCredits(credits: number): string {
  return `${credits} cr`;
}

export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}
