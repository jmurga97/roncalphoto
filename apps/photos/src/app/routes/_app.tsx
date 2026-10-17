import { createFileRoute } from "@tanstack/react-router";

import { MainLayout } from "@app/layouts/main-layout";
import { trpc } from "@lib/api/client";

export const Route = createFileRoute("/_app")({
  component: MainLayout,
  loader: ({ context }) => context.queryClient.ensureQueryData(trpc.sessions.list.queryOptions()),
});
