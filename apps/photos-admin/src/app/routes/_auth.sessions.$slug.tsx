import { sessionDetailQueryOptions } from "@lib/api/sessions/query-options";
import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { SessionEditorView } from "@pages/sessions/session-editor-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/sessions/$slug")({
  component: () => <SessionEditorView mode="edit" />,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(sessionDetailQueryOptions(params.slug)),
      context.queryClient.ensureQueryData(tagsListQueryOptions()),
    ]);
  },
});
