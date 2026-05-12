import { apiClient } from "@lib/api/client";

import type { ApiTagWithSessions, Tag } from "@roncal/shared";

export const tagsService = {
  async getTagBySlug(slug: string): Promise<ApiTagWithSessions> {
    return apiClient.get<ApiTagWithSessions>(`/api/tags/${encodeURIComponent(slug)}`);
  },
  async getTags(): Promise<Tag[]> {
    return apiClient.get<Tag[]>("/api/tags");
  },
};
