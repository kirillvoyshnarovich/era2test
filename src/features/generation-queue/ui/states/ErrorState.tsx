import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[14px] border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <p className="max-w-md text-sm leading-relaxed text-foreground">
        Произошла ошибка. Попробуйте позже или обратитесь в тех. поддержку
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-5">
        Повторить
      </Button>
    </div>
  );
}
