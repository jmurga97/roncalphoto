import { httpClient, readApiResponse } from "@lib/http-client";
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
    const response = await httpClient("/api/sessions", {
      body: JSON.stringify(input),
      method: "POST",
    });

    return readApiResponse<ApiSession>(response);
  },
  async deleteSession(slug: string) {
    const response = await httpClient(`/api/sessions/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });

    return readApiResponse<{ deleted: true }>(response);
  },
  async getSessionBySlug(slug: string): Promise<ApiSession> {
    const response = await httpClient(`/api/sessions/${encodeURIComponent(slug)}`);
    return readApiResponse<ApiSession>(response);
  },
  async getSessions(options: GetSessionsOptions = {}): Promise<ApiSession[]> {
    const include = options.includePhotos ? "?include=photos" : "";
    const response = await httpClient(`/api/sessions${include}`);
    return readApiResponse<ApiSession[]>(response);
  },
  async updateSession(slug: string, input: SessionMutationInput): Promise<ApiSession> {
    const response = await httpClient(`/api/sessions/${encodeURIComponent(slug)}`, {
      body: JSON.stringify(input),
      method: "PUT",
    });

    return readApiResponse<ApiSession>(response);
  },
};
