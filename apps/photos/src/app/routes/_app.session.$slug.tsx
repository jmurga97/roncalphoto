import { createFileRoute } from "@tanstack/react-router";

import { SessionGalleryView } from "@/pages/gallery";
import { sessionDetailQueryOptions } from "@lib/api/sessions/query-options";
import { validatePhotoSearch } from "@utils/validate-photo-search";

export const Route = createFileRoute("/_app/session/$slug")({
  component: SessionGalleryView,
  validateSearch: validatePhotoSearch,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(sessionDetailQueryOptions(params.slug)),
});
