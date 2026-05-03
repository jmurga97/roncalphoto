import { AdminShell } from "@components/shell/admin-shell";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { authClient } from "@lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AdminShell,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw redirect({ to: "/login" });
    }

    return { session };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(sessionsListQueryOptions()),
      context.queryClient.ensureQueryData(tagsListQueryOptions()),
    ]);
  },
});
