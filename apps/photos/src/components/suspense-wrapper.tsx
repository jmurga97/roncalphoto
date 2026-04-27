import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { type ReactNode, Suspense } from "react";
import { ErrorBoundary } from "./error/error-boundary";

interface SuspenseWrapperProps {
  children: ReactNode;
  errorFallback: ReactNode;
  fallback: ReactNode;
  slug: string;
}

export function SuspenseWrapper({ children, errorFallback, fallback, slug }: SuspenseWrapperProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary fallback={errorFallback} onReset={reset} resetKey={slug}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
