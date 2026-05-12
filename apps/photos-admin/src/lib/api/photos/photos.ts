import { apiClient } from "@lib/api/client";

import type { ApiPhoto, PaginatedResponse, PhotoMetadata } from "@roncal/shared";

export interface PhotosListParams {
  page: number;
  pageSize: number;
}

export interface PhotoMutationInput {
  about: string;
  alt: string;
  metadata?: Partial<PhotoMetadata>;
  miniature: string;
  sessionId: string;
  sortOrder?: number;
  url: string;
}

export const photosService = {
  async createPhoto(input: PhotoMutationInput): Promise<ApiPhoto> {
    return apiClient.post<ApiPhoto>("/api/photos", input);
  },
  async deletePhoto(id: string) {
    return apiClient.delete<{ deleted: true }>(`/api/photos/${encodeURIComponent(id)}`);
  },
  async getPhotoById(id: string): Promise<ApiPhoto> {
    return apiClient.get<ApiPhoto>(`/api/photos/${encodeURIComponent(id)}`);
  },
  async listPhotos({ page, pageSize }: PhotosListParams): Promise<PaginatedResponse<ApiPhoto>> {
    return apiClient.getPaginated<ApiPhoto>(`/api/photos?page=${page}&pageSize=${pageSize}`);
  },
  async updatePhoto(id: string, input: PhotoMutationInput): Promise<ApiPhoto> {
    return apiClient.put<ApiPhoto>(`/api/photos/${encodeURIComponent(id)}`, input);
  },
};
