import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SpinnerProps extends ComponentProps<typeof Loader2> {
  label?: string;
}

function Spinner({ className, label = "Загрузка", ...props }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn("size-4 animate-spin text-primary", className)}
      {...props}
    />
  );
}

export { Spinner };
