import { httpClient, readApiResponse } from "@lib/http-client";
import { type ApiSession, type Session, apiSessionToSession } from "@roncal/shared";

export const sessionsService = {
  async getSessionBySlug(slug: string): Promise<Session> {
    const response = await httpClient(`/api/sessions/${encodeURIComponent(slug)}`);
    const session = await readApiResponse<ApiSession>(response);

    return apiSessionToSession(session);
  },
  async getSessions(): Promise<Session[]> {
    const response = await httpClient("/api/sessions?include=photos");
    const sessions = await readApiResponse<ApiSession[]>(response);

    return sessions.map(apiSessionToSession);
  },
};
