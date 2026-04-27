import { GalleryView } from "@/pages/gallery";
import { sessionDetailQueryOptions } from "@lib/api/sessions/query-options";
import { createFileRoute } from "@tanstack/react-router";
import { validatePhotoSearch } from "@utils/validate-photo-search";

export const Route = createFileRoute("/_app/session/$slug")({
  component: GalleryView,
  validateSearch: validatePhotoSearch,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(sessionDetailQueryOptions(params.slug)),
});
