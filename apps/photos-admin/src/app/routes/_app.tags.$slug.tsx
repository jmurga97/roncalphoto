import { tagDetailQueryOptions } from "@lib/api/tags/query-options";
import { TagDetailView } from "@pages/tags/tag-detail-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/tags/$slug")({
  component: TagDetailView,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(tagDetailQueryOptions(params.slug)),
});
