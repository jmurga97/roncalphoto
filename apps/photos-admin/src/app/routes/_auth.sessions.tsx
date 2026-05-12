import { createFileRoute } from "@tanstack/react-router";

import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { SessionsListView } from "@pages/sessions/sessions-list-view";

export const Route = createFileRoute("/_auth/sessions")({
  component: SessionsListView,
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsListQueryOptions()),
});
