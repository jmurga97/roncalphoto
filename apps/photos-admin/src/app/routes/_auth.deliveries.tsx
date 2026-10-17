import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { deliveriesListQueryOptions } from "@lib/deliveries/list-query";
import { DeliveriesListView } from "@pages/deliveries/deliveries-list-view";

export const Route = createFileRoute("/_auth/deliveries")({
  component: DeliveriesRoute,
  loader: ({ context }) => context.queryClient.ensureQueryData(deliveriesListQueryOptions()),
});

function DeliveriesRoute() {
  const { pathname } = useLocation();

  return pathname === "/deliveries" ? <DeliveriesListView /> : <Outlet />;
}
