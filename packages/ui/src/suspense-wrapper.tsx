import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { ErrorBoundary } from "./error-boundary";

import type { ReactNode } from "react";

interface SuspenseWrapperProps {
  children: ReactNode;
  errorFallback: ReactNode;
  fallback: ReactNode;
  resetKey?: boolean | number | string | null | undefined;
}

export function SuspenseWrapper({
  children,
  errorFallback,
  fallback,
  resetKey,
}: SuspenseWrapperProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary fallback={errorFallback} onReset={reset} resetKey={resetKey}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
