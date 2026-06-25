import { Inbox } from "lucide-react";

interface EmptyStateProps {
  hasFilters?: boolean;
}

export function EmptyState({ hasFilters = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[14px] border border-border bg-card/40 px-6 py-16 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
        style={{
          background: "rgba(232,84,32,0.08)",
          borderColor: "rgba(232,84,32,0.2)",
          color: "hsl(var(--primary))",
        }}
      >
        <Inbox className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <p className="max-w-md text-base font-medium text-foreground">
        Сейчас нет активных задач в очереди
      </p>
      {hasFilters && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Попробуйте изменить фильтры или поисковый запрос.
        </p>
      )}
    </div>
  );
}
