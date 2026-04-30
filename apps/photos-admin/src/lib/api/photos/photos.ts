import { httpClient, readApiResponse, readPaginatedApiResponse } from "@lib/http-client";
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
    const response = await httpClient("/api/photos", {
      body: JSON.stringify(input),
      method: "POST",
    });

    return readApiResponse<ApiPhoto>(response);
  },
  async deletePhoto(id: string) {
    const response = await httpClient(`/api/photos/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    return readApiResponse<{ deleted: true }>(response);
  },
  async getPhotoById(id: string): Promise<ApiPhoto> {
    const response = await httpClient(`/api/photos/${encodeURIComponent(id)}`);
    return readApiResponse<ApiPhoto>(response);
  },
  async listPhotos({ page, pageSize }: PhotosListParams): Promise<PaginatedResponse<ApiPhoto>> {
    const response = await httpClient(`/api/photos?page=${page}&pageSize=${pageSize}`);
    return readPaginatedApiResponse<ApiPhoto>(response);
  },
  async updatePhoto(id: string, input: PhotoMutationInput): Promise<ApiPhoto> {
    const response = await httpClient(`/api/photos/${encodeURIComponent(id)}`, {
      body: JSON.stringify(input),
      method: "PUT",
    });

    return readApiResponse<ApiPhoto>(response);
  },
};
