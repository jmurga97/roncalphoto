import { createFileRoute } from "@tanstack/react-router";

import { CanvasView } from "@/pages/canvas";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { validatePhotoSearch } from "@utils/validate-photo-search";

export const Route = createFileRoute("/canvas")({
  component: CanvasView,
  validateSearch: validatePhotoSearch,
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsListQueryOptions()),
});
