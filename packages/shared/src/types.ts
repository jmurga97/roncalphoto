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

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}
