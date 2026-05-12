import { createFileRoute } from "@tanstack/react-router";

import { tagDetailQueryOptions } from "@lib/api/tags/query-options";
import { TagDetailView } from "@pages/tags/tag-detail-view";

export const Route = createFileRoute("/_auth/tags/$slug")({
  component: TagDetailView,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(tagDetailQueryOptions(params.slug)),
});
