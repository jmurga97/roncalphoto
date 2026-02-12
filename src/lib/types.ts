// src/lib/types.ts

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
 * Session summary for listing.
 * Contains photo summaries instead of full photos.
 */
export interface SessionSummary {
  id: string;
  title: string;
  description: string; // Rich text (HTML)
  category: string;
  photoCount: number;
  coverPhoto: PhotoSummary; // First photo as cover
}

/**
 * Full session data with all photos.
 */
export interface Session {
  id: string;
  title: string;
  description: string; // Rich text (HTML)
  category: string;
  photos: Photo[];
}

/**
 * Category with session summaries (for navigation).
 */
export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  sessionCount: number;
}

/**
 * Full category with all sessions.
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  sessions: Session[];
}

/**
 * API response types for future D1 integration
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
