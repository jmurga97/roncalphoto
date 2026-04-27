import { normalizePhotoMetadata } from "./normalizers";
import type { ApiPhoto, ApiSession, Photo, Session } from "./types";

/**
 * Maps public API photo payloads to canonical frontend domain type.
 */
export function apiPhotoToPhoto(apiPhoto: ApiPhoto): Photo {
  return {
    id: apiPhoto.id,
    url: apiPhoto.url,
    miniature: apiPhoto.miniature,
    alt: apiPhoto.alt,
    about: apiPhoto.about,
    metadata: normalizePhotoMetadata(apiPhoto.metadata),
  };
}

/**
 * Maps API session payloads to canonical frontend domain type.
 */
export function apiSessionToSession(apiSession: ApiSession): Session {
  return {
    id: apiSession.id,
    slug: apiSession.slug,
    title: apiSession.title,
    description: apiSession.description,
    createdAt: apiSession.createdAt,
    tags: apiSession.tags,
    photos: (apiSession.photos ?? []).map(apiPhotoToPhoto),
  };
}
