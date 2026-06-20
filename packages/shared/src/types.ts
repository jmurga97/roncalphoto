// @roncal/shared - Domain types shared between frontend and API
//
// These are the canonical domain types for the RoncalPhoto project.
// The frontend uses these directly; the API transforms DB rows into these.
// Convention: all fields are non-nullable (API transforms nulls to defaults).

/**
 * Photo metadata - technical camera settings
 */
export interface PhotoMetadata {
  iso: number;
  aperture: string; // e.g., "f/2.8"
  shutterSpeed: string; // e.g., "1/250"
  lens: string; // e.g., "24-70mm f/2.8"
  camera: string; // e.g., "Canon EOS R5"
}

/**
 * Lightweight photo data for initial load.
 * Only includes IDs and thumbnail URLs for the carousel.
 * Used to minimize initial payload from D1.
 */
export interface PhotoSummary {
  id: string;
  miniature: string; // Thumbnail URL (R2)
  alt: string;
}

/**
 * Full photo data with all details.
 * Extends PhotoSummary with full-size image and metadata.
 * Loaded on-demand when viewing a photo.
 */
export interface Photo extends PhotoSummary {
  url: string; // Full-size image URL (R2)
  about: string; // Additional text about the photo
  metadata: PhotoMetadata;
}

/**
 * Reusable session tag.
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/**
 * Full session data with all photos.
 */
export interface Session {
  id: string;
  slug: string;
  title: string;
  description: string; // Rich text (HTML)
  createdAt: string;
  tags: Tag[];
  photos: Photo[];
}

/**
 * API wire contracts
 * These are the public payloads exchanged with /api/* endpoints.
 */
export interface ApiPhoto extends Photo {
  sessionId: string;
  sortOrder: number;
}

export interface ApiSession {
  id: string;
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  tags: Tag[];
  photos?: ApiPhoto[];
}

export interface ApiTagWithSessions {
  tag: Tag;
  sessions: ApiSession[];
}

export interface CreatePhotoInput {
  id?: string;
  sessionId: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sortOrder?: number;
  metadata?: Partial<PhotoMetadata>;
}

export type UpdatePhotoInput = Partial<Omit<CreatePhotoInput, "id">>;

export interface DeleteResult {
  deleted: true;
}

export type PhotoUploadContentType = "image/jpeg" | "image/png" | "image/webp";

export type PhotoUploadStatus =
  | "awaiting_upload"
  | "queued"
  | "processing"
  | "succeeded"
  | "failed";

export type PhotoUploadOriginalRetentionStatus =
  | "pending"
  | "retained"
  | "deleted"
  | "delete_failed";

export interface CreatePhotoUploadInput {
  sessionId: string;
  filename: string;
  contentType: PhotoUploadContentType;
  sizeBytes: number;
  alt: string;
  about: string;
  sortOrder?: number;
  metadata?: Partial<PhotoMetadata>;
}

export type PhotoUploadMutationInput = Omit<
  CreatePhotoUploadInput,
  "filename" | "contentType" | "sizeBytes"
>;

export interface SignedPhotoUpload {
  url: string;
  expiresAt: string;
  headers: {
    "Content-Type": string;
  };
}

export interface CreatePhotoUploadResult {
  uploadId: string;
  photoId: string;
  status: PhotoUploadStatus;
  upload: SignedPhotoUpload | null;
}

export interface PhotoUploadError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface PhotoUploadStatusResult {
  uploadId: string;
  photoId: string;
  status: PhotoUploadStatus;
  attempts: number;
  originalRetentionStatus: PhotoUploadOriginalRetentionStatus;
  error: PhotoUploadError | null;
  photo: ApiPhoto | null;
}

/**
 * Client delivery — a private, temporary handoff of a finished session.
 * Separate from the public portfolio: photos are uploaded as-is (no
 * optimization) and purged from storage after a retention window, while the
 * record is kept as history.
 */
export interface DeliveryPhoto {
  id: string;
  url: string; // Full-size image URL (R2)
  title: string; // Derived from the uploaded file
  takenAt: string; // Capture date (empty string when unknown)
  sizeBytes: number; // File weight in bytes
  sortOrder: number;
}

export interface Delivery {
  id: string;
  token: string;
  title: string;
  photosAvailable: boolean; // false once photos were purged after retention
  photos: DeliveryPhoto[];
}

/**
 * API wire contract for a client delivery.
 */
export interface ApiDeliveryPhoto {
  id: string;
  url: string;
  title: string;
  takenAt: string;
  sizeBytes: number;
  sortOrder: number;
}

export interface ApiDelivery {
  id: string;
  token: string;
  title: string;
  photosAvailable: boolean;
  photos: ApiDeliveryPhoto[];
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
