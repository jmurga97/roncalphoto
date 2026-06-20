import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { SessionsListView } from "@pages/sessions/sessions-list-view";

export const Route = createFileRoute("/_auth/sessions")({
  component: SessionsRoute,
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsListQueryOptions()),
});

function SessionsRoute() {
  const location = useLocation();

  return location.pathname === "/sessions" ? <SessionsListView /> : <Outlet />;
}
