import { photoDetailQueryOptions } from "@lib/api/photos/query-options";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { PhotoEditorView } from "@pages/photos/photo-editor-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/photos/$id")({
  component: () => <PhotoEditorView mode="edit" />,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(photoDetailQueryOptions(params.id)),
      context.queryClient.ensureQueryData(sessionsListQueryOptions()),
    ]);
  },
});
