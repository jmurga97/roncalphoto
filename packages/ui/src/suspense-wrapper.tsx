import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { type ReactNode, Suspense } from "react";
import { ErrorBoundary } from "./error-boundary";

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
