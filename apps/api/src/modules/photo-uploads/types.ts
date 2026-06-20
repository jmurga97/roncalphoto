import type {
  CreatePhotoUploadInput,
  PhotoUploadError,
  PhotoUploadOriginalRetentionStatus,
  PhotoUploadStatus,
  SignedPhotoUpload,
} from "@roncal/shared";

export type { CreatePhotoUploadInput };

export type ImageUploadStatus = PhotoUploadStatus;

export interface CreateImageWorkerUploadInput {
  idempotencyKey: string;
  photoId: string;
  file: Pick<CreatePhotoUploadInput, "filename" | "contentType" | "sizeBytes">;
}

export interface WorkerCreateUploadResult {
  uploadId: string;
  status: ImageUploadStatus;
  upload: SignedPhotoUpload | null;
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
  originalRetentionStatus: PhotoUploadOriginalRetentionStatus;
  manifest: {
    source: {
      contentType: string;
      width: number;
      height: number;
      sizeBytes: number;
    };
    variants: Record<string, WorkerImageVariant>;
  } | null;
  error: PhotoUploadError | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
