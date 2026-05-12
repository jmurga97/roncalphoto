import { createFileRoute } from "@tanstack/react-router";

import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { PhotoEditorView } from "@pages/photos/photo-editor-view";

export const Route = createFileRoute("/_auth/photos/new")({
  component: () => <PhotoEditorView mode="create" />,
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsListQueryOptions()),
});
