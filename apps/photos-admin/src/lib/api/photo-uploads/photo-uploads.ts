import { apiClient } from "@lib/api/client";

import type { PhotoMutationInput } from "@lib/api/photos/photos";
import type { ApiPhoto } from "@roncal/shared";

interface CreatePhotoUploadResult {
  uploadId: string;
  photoId: string;
  status: PhotoUploadStatus;
  upload: {
    url: string;
    expiresAt: string;
    headers: {
      "Content-Type": string;
    };
  } | null;
}

type PhotoUploadStatus = "awaiting_upload" | "queued" | "processing" | "succeeded" | "failed";

interface PhotoUploadStatusResult {
  uploadId: string;
  photoId: string;
  status: PhotoUploadStatus;
  attempts: number;
  originalRetentionStatus: "pending" | "retained" | "deleted" | "delete_failed";
  error: {
    code: string;
    message: string;
    retryable: boolean;
  } | null;
  photo: ApiPhoto | null;
}

export type PhotoUploadMutationInput = Omit<PhotoMutationInput, "miniature" | "url">;

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
    const created = await apiClient.post<CreatePhotoUploadResult>(
      "/api/photo-uploads",
      {
        ...input,
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      },
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
