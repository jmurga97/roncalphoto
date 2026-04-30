import { httpClient, readApiResponse } from "@lib/http-client";
import type { ApiTagWithSessions, Tag } from "@roncal/shared";

export const tagsService = {
  async getTagBySlug(slug: string): Promise<ApiTagWithSessions> {
    const response = await httpClient(`/api/tags/${encodeURIComponent(slug)}`);
    return readApiResponse<ApiTagWithSessions>(response);
  },
  async getTags(): Promise<Tag[]> {
    const response = await httpClient("/api/tags");
    return readApiResponse<Tag[]>(response);
  },
};
