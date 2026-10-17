import type { Session } from "@roncal/api/router";

export function getRelatedSessions(sessions: Session[], activeSession?: Session): Session[] {
  if (!activeSession) {
    return [];
  }

  const activeTagSlugs = new Set(activeSession.tags.map((tag) => tag.slug));

  return sessions.filter((session) => {
    if (session.slug === activeSession.slug) {
      return false;
    }

    return session.tags.some((tag) => activeTagSlugs.has(tag.slug));
  });
}
