import { apiClient } from "@lib/api/client";

import type {
  ApiPhoto,
  CreatePhotoUploadInput,
  CreatePhotoUploadResult,
  PhotoUploadContentType,
  PhotoUploadMutationInput,
  PhotoUploadStatusResult,
} from "@roncal/shared";

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function pollUntilComplete(uploadId: string): Promise<ApiPhoto> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const result = await apiClient.get<PhotoUploadStatusResult>(
      `/api/photo-uploads/${encodeURIComponent(uploadId)}`,
    );

    if (result.status === "succeeded" && result.photo) {
      return result.photo;
    }

    if (result.status === "failed") {
      throw new Error(result.error?.message ?? "No se pudo procesar la imagen.");
    }

    await wait(1000);
  }

  throw new Error("La imagen sigue procesándose. Vuelve a intentarlo en unos segundos.");
}

export const photoUploadsService = {
  async uploadPhoto(
    file: File,
    input: PhotoUploadMutationInput,
    idempotencyKey: string,
  ): Promise<ApiPhoto> {
    const requestBody: CreatePhotoUploadInput = {
      ...input,
      filename: file.name,
      contentType: file.type as PhotoUploadContentType,
      sizeBytes: file.size,
    };
    const created = await apiClient.post<CreatePhotoUploadResult>(
      "/api/photo-uploads",
      requestBody,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
    );

    if (created.upload) {
      const uploadResponse = await fetch(created.upload.url, {
        method: "PUT",
        headers: created.upload.headers,
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`No se pudo subir el archivo (${uploadResponse.status}).`);
      }
    }

    return pollUntilComplete(created.uploadId);
  },
};
