import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { DeliveriesListView } from "@pages/deliveries/deliveries-list-view";

export const Route = createFileRoute("/_auth/deliveries")({
  component: DeliveriesRoute,
});

function DeliveriesRoute() {
  const location = useLocation();

  return location.pathname === "/deliveries" ? <DeliveriesListView /> : <Outlet />;
}
