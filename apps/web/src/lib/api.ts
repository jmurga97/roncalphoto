// src/lib/api.ts
//
// API client for build-time data fetching from d1-roncalphoto API.
// This replaces direct D1 database access with HTTP calls to the deployed API.

import type { Category, CategorySummary, Photo, PhotoMetadata, Session } from "@roncal/shared";

// ============================================================================
// Configuration
// ============================================================================

const API_URL = import.meta.env.API_URL || "http://localhost:8788";
const API_KEY = import.meta.env.API_KEY || "";

// ============================================================================
// Types for API responses (matching d1-roncalphoto response format)
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

interface ApiSession {
  id: string;
  categoryId: string;
  title: string;
  description: string;
}

interface ApiPhoto {
  id: string;
  sessionId: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sortOrder: number;
  metadata?: {
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    lens?: string;
    camera?: string;
  };
}

interface ApiCategoryWithSessions extends ApiCategory {
  sessions: ApiSession[];
}

interface ApiSessionWithPhotos extends ApiSession {
  photos: ApiPhoto[];
}

// ============================================================================
// API Client
// ============================================================================

async function fetchApi<T>(endpoint: string): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();

  if (!json.success) {
    throw new Error(json.error || "Unknown API error");
  }

  return json.data;
}

// ============================================================================
// Transform functions (API format -> Frontend format)
// ============================================================================

function transformPhoto(apiPhoto: ApiPhoto): Photo {
  return {
    id: apiPhoto.id,
    url: apiPhoto.url,
    miniature: apiPhoto.miniature,
    alt: apiPhoto.alt,
    about: apiPhoto.about,
    metadata: {
      iso: apiPhoto.metadata?.iso ?? 0,
      aperture: apiPhoto.metadata?.aperture ?? "",
      shutterSpeed: apiPhoto.metadata?.shutterSpeed ?? "",
      lens: apiPhoto.metadata?.lens ?? "",
      camera: apiPhoto.metadata?.camera ?? "",
    },
  };
}

function transformSession(apiSession: ApiSessionWithPhotos, categorySlug: string): Session {
  return {
    id: apiSession.id,
    title: apiSession.title,
    description: apiSession.description,
    category: categorySlug,
    photos: apiSession.photos.map(transformPhoto),
  };
}

function transformCategory(
  apiCategory: ApiCategoryWithSessions,
  sessionsWithPhotos: ApiSessionWithPhotos[],
): Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    sessions: sessionsWithPhotos.map((s) => transformSession(s, apiCategory.slug)),
  };
}

// ============================================================================
// Public API functions
// ============================================================================

/**
 * Get all categories (without sessions).
 */
export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const categories = await fetchApi<ApiCategory[]>("/api/categories");

  // We need to fetch each category to get session count
  const summaries: CategorySummary[] = [];

  for (const cat of categories) {
    const fullCategory = await fetchApi<ApiCategoryWithSessions>(`/api/categories/${cat.slug}`);
    summaries.push({
      id: fullCategory.id,
      name: fullCategory.name,
      slug: fullCategory.slug,
      sessionCount: fullCategory.sessions.length,
    });
  }

  return summaries;
}

/**
 * Get all categories with their sessions and photos.
 * This is the main function used for build-time static generation.
 */
export async function getCategories(): Promise<Category[]> {
  // 1. Get all categories
  const categories = await fetchApi<ApiCategory[]>("/api/categories");

  // 2. For each category, get full data with sessions
  const fullCategories: Category[] = [];

  for (const cat of categories) {
    // Get category with sessions
    const categoryWithSessions = await fetchApi<ApiCategoryWithSessions>(
      `/api/categories/${cat.slug}`,
    );

    // For each session, get full data with photos
    const sessionsWithPhotos: ApiSessionWithPhotos[] = [];
    for (const session of categoryWithSessions.sessions) {
      const sessionWithPhotos = await fetchApi<ApiSessionWithPhotos>(`/api/sessions/${session.id}`);
      sessionsWithPhotos.push(sessionWithPhotos);
    }

    fullCategories.push(transformCategory(categoryWithSessions, sessionsWithPhotos));
  }

  return fullCategories;
}

/**
 * Get a single category by slug with all sessions and photos.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const categoryWithSessions = await fetchApi<ApiCategoryWithSessions>(`/api/categories/${slug}`);

    // Get full session data with photos
    const sessionsWithPhotos: ApiSessionWithPhotos[] = [];
    for (const session of categoryWithSessions.sessions) {
      const sessionWithPhotos = await fetchApi<ApiSessionWithPhotos>(`/api/sessions/${session.id}`);
      sessionsWithPhotos.push(sessionWithPhotos);
    }

    return transformCategory(categoryWithSessions, sessionsWithPhotos);
  } catch {
    return null;
  }
}

/**
 * Get a full session with all photos.
 */
export async function getSession(categorySlug: string, sessionId: string): Promise<Session | null> {
  try {
    const sessionWithPhotos = await fetchApi<ApiSessionWithPhotos>(`/api/sessions/${sessionId}`);
    return transformSession(sessionWithPhotos, categorySlug);
  } catch {
    return null;
  }
}

/**
 * Get full photo data by ID.
 */
export async function getPhotoById(photoId: string): Promise<Photo | null> {
  try {
    const photo = await fetchApi<ApiPhoto>(`/api/photos/${photoId}`);
    return transformPhoto(photo);
  } catch {
    return null;
  }
}

/**
 * Get photo metadata by ID.
 */
export async function getPhotoMetadata(photoId: string): Promise<PhotoMetadata | null> {
  const photo = await getPhotoById(photoId);
  return photo?.metadata ?? null;
}
