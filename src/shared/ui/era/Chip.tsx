import * as React from "react"
import { cn } from "@/shared/lib/utils"

export type ChipVariant = "soft" | "solid"

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  variant?: ChipVariant
  children: React.ReactNode
}

const chipInactiveClass =
  "bg-card border-[hsl(var(--border))] text-muted-foreground hover:text-foreground hover:border-[hsl(20_17%_20%)]"

const chipActiveByVariant: Record<ChipVariant, string> = {
  soft: "bg-accent border-primary text-[#ff7a3d]",
  solid:
    "bg-primary border-primary text-primary-foreground shadow-[0_6px_24px_-6px_rgba(232,84,32,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]",
}

/**
 * ERA2 Chip — pill filter button. Use for tags, filters, segmented controls.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ active = false, variant = "soft", children, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-active={active}
      data-variant={variant}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 h-7 rounded-full",
        "text-[13px] font-medium leading-none",
        "border transition-colors duration-200",
        active ? chipActiveByVariant[variant] : chipInactiveClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Chip.displayName = "Chip"
