import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@lib/api/client";
import { SessionEditorView } from "@pages/sessions/session-editor-view";

export const Route = createFileRoute("/_auth/sessions/new")({
  component: () => <SessionEditorView mode="create" />,
  loader: ({ context }) => context.queryClient.ensureQueryData(trpc.tags.list.queryOptions()),
});
