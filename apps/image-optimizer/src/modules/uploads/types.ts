import type { UploadQueueMessage } from "@/config/types";
import type { AcceptedImageMimeType } from "@/modules/images/types";

export const uploadJobStatuses = [
  "awaiting_upload",
  "queued",
  "processing",
  "done",
  "error",
] as const;

export type UploadJobStatus = (typeof uploadJobStatuses)[number];

export interface PhotoMetadataInput {
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  lens?: string;
  camera?: string;
}

export interface CreateUploadFileInput {
  filename: string;
  contentType: AcceptedImageMimeType;
  sizeBytes: number;
  alt: string;
  about: string;
  sortOrder?: number;
  metadata?: PhotoMetadataInput;
}

export interface CreateUploadInput {
  sessionId: string;
  files: CreateUploadFileInput[];
}

export interface CreateUploadJobRecord {
  id: string;
  photoId: string;
  sessionId: string;
  originalKey: string;
  mainKey: string;
  thumbnailKey: string;
  originalFilename: string;
  contentType: AcceptedImageMimeType;
  sizeBytes: number;
  alt: string;
  about: string;
  sortOrder: number;
  metadata?: PhotoMetadataInput;
}

export interface PhotoUploadJob extends CreateUploadJobRecord {
  status: UploadJobStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface PresignedUpload {
  uploadId: string;
  photoId: string;
  uploadUrl: string;
  originalKey: string;
  mainKey: string;
  thumbnailKey: string;
  expiresAt: string;
  headers: {
    "Content-Type": AcceptedImageMimeType;
  };
}

export interface UploadJobProgress {
  total: number;
  awaitingUpload: number;
  queued: number;
  processing: number;
  done: number;
  error: number;
}

export interface UploadJobsResponse {
  jobs: PhotoUploadJob[];
  progress: UploadJobProgress;
}

export type ImageProcessingMessage = UploadQueueMessage;
