import { MainLayout } from "@app/layouts/main-layout";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: MainLayout,
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsListQueryOptions()),
});
