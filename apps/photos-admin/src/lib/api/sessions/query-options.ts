import { queryOptions } from "@tanstack/react-query";
import { adminQueryKeys } from "../query-keys";
import { sessionsService } from "./sessions";

export function sessionsListQueryOptions() {
  return queryOptions({
    queryKey: adminQueryKeys.sessions.list(),
    queryFn: () => sessionsService.getSessions({ includePhotos: true }),
    staleTime: 60 * 1000,
  });
}

export function sessionDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: adminQueryKeys.sessions.detail(slug),
    queryFn: () => sessionsService.getSessionBySlug(slug),
    staleTime: 60 * 1000,
  });
}
