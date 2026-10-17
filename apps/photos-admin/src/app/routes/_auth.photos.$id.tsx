import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@lib/api/client";
import { PhotoEditorView } from "@pages/photos/photo-editor-view";

export const Route = createFileRoute("/_auth/photos/$id")({
  component: PhotoEditorView,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(trpc.photos.get.queryOptions({ id: params.id })),
      context.queryClient.ensureQueryData(trpc.sessions.list.queryOptions()),
    ]),
});
