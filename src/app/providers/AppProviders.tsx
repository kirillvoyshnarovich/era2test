import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth";
import { QueueGenerationGlobalState, QueueProvider } from "@/features/generation-queue";
import { ThemeProvider } from "@/features/theme-switcher";
import { RouterProvider } from "@/shared/routing";
import { TooltipProvider } from "@/shared/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueueProvider>
          <TooltipProvider>
            <RouterProvider>
              {children}
              <QueueGenerationGlobalState />
            </RouterProvider>
          </TooltipProvider>
        </QueueProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
