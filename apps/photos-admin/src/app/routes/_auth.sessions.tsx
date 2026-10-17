import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { trpc } from "@lib/api/client";
import { SessionsListView } from "@pages/sessions/sessions-list-view";

export const Route = createFileRoute("/_auth/sessions")({
  component: SessionsRoute,
  loader: ({ context }) => context.queryClient.ensureQueryData(trpc.sessions.list.queryOptions()),
});

function SessionsRoute() {
  const { pathname } = useLocation();

  return pathname === "/sessions" ? <SessionsListView /> : <Outlet />;
}
