import { RouteErrorState } from "@components/error/error-state";
import { LoadingState } from "@components/loading/loading-state";
import { NotFoundState } from "@components/not-found-state";
import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

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
  pendingComponent: () => <LoadingState label="Cargando navegación..." />,
});
