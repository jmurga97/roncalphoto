import type { PhotoMetadata } from "@roncal/shared";

export type ImageUploadStatus =
  | "awaiting_upload"
  | "queued"
  | "processing"
  | "succeeded"
  | "failed";

export interface CreatePhotoUploadInput {
  sessionId: string;
  filename: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes: number;
  alt: string;
  about: string;
  sortOrder?: number;
  metadata?: Partial<PhotoMetadata>;
}

export interface CreateImageWorkerUploadInput {
  idempotencyKey: string;
  photoId: string;
  file: Pick<CreatePhotoUploadInput, "filename" | "contentType" | "sizeBytes">;
}

export interface WorkerCreateUploadResult {
  uploadId: string;
  status: ImageUploadStatus;
  upload: {
    url: string;
    expiresAt: string;
    headers: {
      "Content-Type": string;
    };
  } | null;
}

export interface WorkerImageVariant {
  name: string;
  bucket: string;
  key: string;
  publicUrl: string | null;
  contentType: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface WorkerUploadResult {
  uploadId: string;
  productId: string;
  presetId: string;
  externalId: string | null;
  status: ImageUploadStatus;
  attempts: number;
  originalRetentionStatus: "pending" | "retained" | "deleted" | "delete_failed";
  manifest: {
    source: {
      contentType: string;
      width: number;
      height: number;
      sizeBytes: number;
    };
    variants: Record<string, WorkerImageVariant>;
  } | null;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
