import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { trpc } from "@lib/api/client";
import { TagsListView } from "@pages/tags/tags-list-view";

export const Route = createFileRoute("/_auth/tags")({
  component: TagsRoute,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(trpc.tags.list.queryOptions()),
      context.queryClient.ensureQueryData(trpc.sessions.list.queryOptions()),
    ]),
});

function TagsRoute() {
  const { pathname } = useLocation();

  return pathname === "/tags" ? <TagsListView /> : <Outlet />;
}
