import type { photos } from "@/db";
import { type ApiPhoto, type PhotoMetadata, normalizePhotoMetadata } from "@roncal/shared";

type PhotoRow = typeof photos.$inferSelect;

export function toApiPhoto(row: PhotoRow): ApiPhoto {
  return {
    id: row.id,
    sessionId: row.session_id,
    url: row.url,
    miniature: row.miniature,
    alt: row.alt,
    about: row.about,
    sortOrder: row.sort_order,
    metadata: normalizePhotoMetadata({
      iso: row.iso ?? undefined,
      aperture: row.aperture ?? undefined,
      shutterSpeed: row.shutter_speed ?? undefined,
      lens: row.lens ?? undefined,
      camera: row.camera ?? undefined,
    }),
  };
}

export function normalizeMetadata(metadata?: Partial<PhotoMetadata>) {
  return normalizePhotoMetadata(metadata);
}
