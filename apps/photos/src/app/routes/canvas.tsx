import { createFileRoute } from "@tanstack/react-router";

import { CanvasView } from "@/pages/canvas";
import { trpc } from "@lib/api/client";
import { validatePhotoSearch } from "@utils/validate-photo-search";

export const Route = createFileRoute("/canvas")({
  component: CanvasView,
  validateSearch: validatePhotoSearch,
  loader: ({ context }) => context.queryClient.ensureQueryData(trpc.sessions.list.queryOptions()),
});
