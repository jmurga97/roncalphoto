import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { SessionsListView } from "@pages/sessions/sessions-list-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sessions")({
  component: SessionsListView,
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsListQueryOptions()),
});
