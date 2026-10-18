import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { CanvasLoadingState } from "@/pages/canvas/components/canvas-loading-state";
import { RouteErrorState } from "@components/error/error-state";
import { NotFoundState } from "@components/not-found-state";

import type { QueryClient } from "@tanstack/react-query";

export interface PhotosRouterContext {
  queryClient: QueryClient;
}

function RootRouteComponent() {
  return <Outlet />;
}

export const Route = createRootRouteWithContext<PhotosRouterContext>()({
  component: RootRouteComponent,
  errorComponent: RouteErrorState,
  notFoundComponent: NotFoundState,
  pendingComponent: () => <CanvasLoadingState label="Cargando navegación..." />,
});
