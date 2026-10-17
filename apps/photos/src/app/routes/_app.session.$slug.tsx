import { createFileRoute } from "@tanstack/react-router";

import { SessionGalleryView } from "@/pages/gallery";
import { trpc } from "@lib/api/client";
import { validatePhotoSearch } from "@utils/validate-photo-search";

export const Route = createFileRoute("/_app/session/$slug")({
  component: SessionGalleryView,
  validateSearch: validatePhotoSearch,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(trpc.sessions.get.queryOptions({ slug: params.slug })),
});
