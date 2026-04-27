import { queryOptions } from "@tanstack/react-query";
import { sessionsService } from "./sessions";

export function sessionsListQueryOptions() {
  return queryOptions({
    queryKey: ["gallery", "sessions"],
    queryFn: sessionsService.getSessions,
    staleTime: 5 * 60 * 1000,
  });
}

export function sessionDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["gallery", "session", slug],
    queryFn: () => sessionsService.getSessionBySlug(slug),
    staleTime: 60 * 1000,
  });
}
