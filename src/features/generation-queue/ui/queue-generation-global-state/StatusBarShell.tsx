import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export interface StatusBarShellProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function StatusBarShell({ children, className, onClick }: StatusBarShellProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-[#E8542066] bg-[hsl(var(--card))]/95 backdrop-blur-md",
        "max-[480px]:rounded-[20px]",
        "min-[481px]:rounded-[25px]",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
      />
      {children}
    </div>
  );
}
