import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  sessionDetailQueryOptions,
  sessionsListQueryOptions,
} from "@lib/api/sessions/query-options";
import { getRelatedSessions } from "@utils/get-related-sessions";

import { toSidebarNavigationItem } from "../utils/sidebar-mappers";

export function useRelatedSessions(slug: string) {
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const { data: session } = useSuspenseQuery(sessionDetailQueryOptions(slug));

  return useMemo(() => {
    const relatedSessions = getRelatedSessions(sessions, session);
    const hasTagsButNoMatches = session.tags.length > 0 && relatedSessions.length === 0;

    return {
      items: relatedSessions.map((relatedSession) => toSidebarNavigationItem(relatedSession)),
      notice: hasTagsButNoMatches ? "No hay otras sesiones con tags relacionados." : undefined,
    };
  }, [session, sessions]);
}
