import type { photos, sessions } from "@/db";
import { type ApiPhoto, type ApiSession, type Tag, normalizePhotoMetadata } from "@roncal/shared";

type SessionRow = typeof sessions.$inferSelect;
type PhotoRow = typeof photos.$inferSelect;

export function toTag(row: { id: string; name: string; slug: string }): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

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

export function toApiSession(row: SessionRow, tags: Tag[], photos?: ApiPhoto[]): ApiSession {
  const session: ApiSession = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    tags,
  };

  if (photos) {
    session.photos = photos;
  }

  return session;
}
