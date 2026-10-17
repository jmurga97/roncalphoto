import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@lib/api/client";
import { TagDetailView } from "@pages/tags/tag-detail-view";

export const Route = createFileRoute("/_auth/tags/$slug")({
  component: TagDetailView,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(trpc.tags.get.queryOptions({ slug: params.slug })),
});
