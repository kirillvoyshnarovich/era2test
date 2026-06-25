import { Download, MoreHorizontal, RotateCcw, Trash2, X } from "lucide-react";
import type { TaskStatus } from "@/entities/generation-task";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

interface TaskActionsProps {
  status: TaskStatus;
  onCancel: () => void;
  onRetry: () => void;
  onDownload: () => void;
  onDelete: () => void;
  className?: string;
  compact?: boolean;
}

export function TaskActions({
  status,
  onCancel,
  onRetry,
  onDownload,
  onDelete,
  className,
  compact = false,
}: TaskActionsProps) {
  const primary =
    status === "queued" || status === "running"
      ? { label: "Отмена", icon: X, onClick: onCancel, iconColor: "var(--text-secondary)" }
      : status === "failed" || status === "canceled"
        ? { label: "Повторить", icon: RotateCcw, onClick: onRetry, iconColor: "var(--c-accent)" }
        : status === "done"
          ? { label: "Скачать", icon: Download, onClick: onDownload, iconColor: "var(--c-accent)" }
          : null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {primary && (
        <Button
          type="button"
          variant={compact ? "ghost" : "outline"}
          size="sm"
          onClick={primary.onClick}
          className={cn("h-8 w-8 rounded-sm text-[13px]", compact && "px-2.5")}
          aria-label={primary.label}
        >
          <primary.icon className="h-4 w-4" color={primary.iconColor} />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm text-muted-foreground hover:text-foreground"
            aria-label="Дополнительные действия"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
