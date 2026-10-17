import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@lib/api/client";
import { OverviewView } from "@pages/overview/overview-view";

export const Route = createFileRoute("/_auth/")({
  component: OverviewRoute,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(trpc.sessions.list.queryOptions()),
      context.queryClient.ensureQueryData(trpc.tags.list.queryOptions()),
    ]),
});

function OverviewRoute() {
  const { session } = Route.useRouteContext();

  // `_auth` redirects to /login without a session; the guard only narrows the type.
  return session ? <OverviewView userEmail={session.user.email} /> : null;
}
