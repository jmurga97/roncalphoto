import { OverviewView } from "@pages/overview/overview-view";
import { createFileRoute } from "@tanstack/react-router";
import { Route as AuthRoute } from "./_auth";

export const Route = createFileRoute("/_auth/")({
  component: OverviewRoute,
});

function OverviewRoute() {
  const { session } = AuthRoute.useRouteContext();

  return <OverviewView userEmail={session.user.email} />;
}
