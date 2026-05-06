import { apiClient } from "@lib/api/client";
import type { ApiSession } from "@roncal/shared";

export interface SessionMutationInput {
  description: string;
  slug?: string;
  tagIds: string[];
  title: string;
}

interface GetSessionsOptions {
  includePhotos?: boolean;
}

export const sessionsService = {
  async createSession(input: SessionMutationInput): Promise<ApiSession> {
    return apiClient.post<ApiSession>("/api/sessions", input);
  },
  async deleteSession(slug: string) {
    return apiClient.delete<{ deleted: true }>(`/api/sessions/${encodeURIComponent(slug)}`);
  },
  async getSessionBySlug(slug: string): Promise<ApiSession> {
    return apiClient.get<ApiSession>(`/api/sessions/${encodeURIComponent(slug)}`);
  },
  async getSessions(options: GetSessionsOptions = {}): Promise<ApiSession[]> {
    const include = options.includePhotos ? "?include=photos" : "";
    return apiClient.get<ApiSession[]>(`/api/sessions${include}`);
  },
  async updateSession(slug: string, input: SessionMutationInput): Promise<ApiSession> {
    return apiClient.put<ApiSession>(`/api/sessions/${encodeURIComponent(slug)}`, input);
  },
};
