import { apiClient } from "@lib/api/client";
import { type ApiSession, type Session, apiSessionToSession } from "@roncal/shared";

export const sessionsService = {
  async getSessionBySlug(slug: string): Promise<Session> {
    const session = await apiClient.get<ApiSession>(`/api/sessions/${encodeURIComponent(slug)}`);
    return apiSessionToSession(session);
  },
  async getSessions(): Promise<Session[]> {
    const sessions = await apiClient.get<ApiSession[]>("/api/sessions?include=photos");
    return sessions.map(apiSessionToSession);
  },
};
