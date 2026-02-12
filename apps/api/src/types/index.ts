// Types for RoncalPhoto API

// Re-export shared types used by both frontend and API
export type { ApiResponse, PaginatedResponse } from "@roncal/shared";

// ============================================================================
// DB Row types (snake_case, matching D1 schema)
// ============================================================================

/**
 * Photo as stored in D1 database
 */
export interface PhotoRow {
  id: string;
  session_id: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sort_order: number;
  iso: number | null;
  aperture: string | null;
  shutter_speed: string | null;
  lens: string | null;
  camera: string | null;
}

/**
 * Session as stored in D1 database
 */
export interface SessionRow {
  id: string;
  category_id: string;
  title: string;
  description: string;
}

/**
 * Category as stored in D1 database
 */
export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

// ============================================================================
// API response types (camelCase, nullable metadata from DB)
// ============================================================================

/**
 * Photo metadata - technical camera settings (nullable from DB)
 */
export interface PhotoMetadata {
  iso: number | null;
  aperture: string | null;
  shutterSpeed: string | null;
  lens: string | null;
  camera: string | null;
}

/**
 * Photo response for API
 */
export interface Photo {
  id: string;
  sessionId: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sortOrder: number;
  metadata: PhotoMetadata;
}

/**
 * Session response for API
 */
export interface Session {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  photos?: Photo[];
}

/**
 * Category response for API
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  sessions?: Session[];
}

// ============================================================================
// DTOs (Create/Update)
// ============================================================================

export interface CreateCategoryDto {
  id?: string;
  name: string;
  slug: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
}

export interface CreateSessionDto {
  id?: string;
  categoryId: string;
  title: string;
  description: string;
}

export interface UpdateSessionDto {
  categoryId?: string;
  title?: string;
  description?: string;
}

export interface CreatePhotoDto {
  id?: string;
  sessionId: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sortOrder?: number;
  metadata?: PhotoMetadata;
}

export interface UpdatePhotoDto {
  sessionId?: string;
  url?: string;
  miniature?: string;
  alt?: string;
  about?: string;
  sortOrder?: number;
  metadata?: PhotoMetadata;
}

// ============================================================================
// Environment bindings
// ============================================================================

/**
 * Environment bindings for Cloudflare Workers
 */
export interface Env {
  DB_RONCALPHOTO: D1Database;
  API_KEY: string;
  ALLOWED_ORIGINS?: string;
}
