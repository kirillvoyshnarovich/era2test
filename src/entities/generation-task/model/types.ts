export type GenType = "text" | "image" | "video" | "audio";

export type TaskStatus = "queued" | "running" | "done" | "failed" | "canceled";

export interface GenerationTask {
  id: string;
  type: GenType;
  model: string;
  prompt: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  status: TaskStatus;
  progress: number;
  credits: number;
  etaSeconds: number;
  errorMessage?: string;
  outputUrl?: string;
}
