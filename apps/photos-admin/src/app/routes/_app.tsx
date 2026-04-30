import { AdminShell } from "@components/shell/admin-shell";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: AdminShell,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(sessionsListQueryOptions()),
      context.queryClient.ensureQueryData(tagsListQueryOptions()),
    ]);
  },
});
