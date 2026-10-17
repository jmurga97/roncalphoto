import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@lib/api/client";
import { SessionEditorView } from "@pages/sessions/session-editor-view";

export const Route = createFileRoute("/_auth/sessions/$slug")({
  component: () => <SessionEditorView mode="edit" />,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(trpc.sessions.get.queryOptions({ slug: params.slug })),
      context.queryClient.ensureQueryData(trpc.tags.list.queryOptions()),
    ]),
});
