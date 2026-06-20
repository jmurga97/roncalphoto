import { apiClient } from "@lib/api/client";

import type { ApiPhoto, CreatePhotoInput, DeleteResult, UpdatePhotoInput } from "@roncal/shared";

export const photosService = {
  async createPhoto(input: CreatePhotoInput): Promise<ApiPhoto> {
    return apiClient.post<ApiPhoto>("/api/photos", input);
  },
  async deletePhoto(id: string) {
    return apiClient.delete<DeleteResult>(`/api/photos/${encodeURIComponent(id)}`);
  },
  async getPhotoById(id: string): Promise<ApiPhoto> {
    return apiClient.get<ApiPhoto>(`/api/photos/${encodeURIComponent(id)}`);
  },
  async listPhotos(): Promise<ApiPhoto[]> {
    return apiClient.get<ApiPhoto[]>("/api/photos");
  },
  async updatePhoto(id: string, input: UpdatePhotoInput): Promise<ApiPhoto> {
    return apiClient.put<ApiPhoto>(`/api/photos/${encodeURIComponent(id)}`, input);
  },
};
