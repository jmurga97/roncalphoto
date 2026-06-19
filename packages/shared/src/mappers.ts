import { normalizePhotoMetadata } from "./normalizers";

import type {
  ApiDelivery,
  ApiDeliveryPhoto,
  ApiPhoto,
  ApiSession,
  Delivery,
  DeliveryPhoto,
  Photo,
  Session,
} from "./types";

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

/**
 * Maps an API delivery photo payload to the canonical frontend domain type.
 */
export function apiDeliveryPhotoToDeliveryPhoto(apiPhoto: ApiDeliveryPhoto): DeliveryPhoto {
  return {
    id: apiPhoto.id,
    url: apiPhoto.url,
    title: apiPhoto.title,
    takenAt: apiPhoto.takenAt,
    sizeBytes: apiPhoto.sizeBytes,
    sortOrder: apiPhoto.sortOrder,
  };
}

/**
 * Maps an API client delivery payload to the canonical frontend domain type.
 */
export function apiDeliveryToDelivery(apiDelivery: ApiDelivery): Delivery {
  return {
    id: apiDelivery.id,
    token: apiDelivery.token,
    title: apiDelivery.title,
    photosAvailable: apiDelivery.photosAvailable,
    photos: apiDelivery.photos.map(apiDeliveryPhotoToDeliveryPhoto),
  };
}
