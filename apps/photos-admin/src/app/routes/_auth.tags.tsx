import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { TagsListView } from "@pages/tags/tags-list-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/tags")({
  component: TagsListView,
  loader: ({ context }) => context.queryClient.ensureQueryData(tagsListQueryOptions()),
});
