import { useApplyThemeFromStore } from "@app/store";
import { queryClient } from "@lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function LayoutUiEffects() {
  useApplyThemeFromStore();
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutUiEffects />
      {children}
    </QueryClientProvider>
  );
}
