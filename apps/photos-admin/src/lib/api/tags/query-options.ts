import { queryOptions } from "@tanstack/react-query";
import { adminQueryKeys } from "../query-keys";
import { tagsService } from "./tags";

export function tagsListQueryOptions() {
  return queryOptions({
    queryKey: adminQueryKeys.tags.list(),
    queryFn: tagsService.getTags,
    staleTime: 5 * 60 * 1000,
  });
}

export function tagDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: adminQueryKeys.tags.detail(slug),
    queryFn: () => tagsService.getTagBySlug(slug),
    staleTime: 60 * 1000,
  });
}
