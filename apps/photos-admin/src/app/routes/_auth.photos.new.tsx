import { createFileRoute } from "@tanstack/react-router";

import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { PhotoUploadView } from "@pages/photos/photo-upload-view";

export const Route = createFileRoute("/_auth/photos/new")({
  component: PhotoUploadView,
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsListQueryOptions()),
});
