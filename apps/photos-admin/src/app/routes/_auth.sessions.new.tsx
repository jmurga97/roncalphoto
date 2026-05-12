import { createFileRoute } from "@tanstack/react-router";

import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { SessionEditorView } from "@pages/sessions/session-editor-view";

export const Route = createFileRoute("/_auth/sessions/new")({
  component: () => <SessionEditorView mode="create" />,
  loader: ({ context }) => context.queryClient.ensureQueryData(tagsListQueryOptions()),
});
