import type { photos, sessions } from "@/db";
import { type ApiPhoto, type ApiSession, type Tag, normalizePhotoMetadata } from "@roncal/shared";

export type SessionRecord = Pick<
  typeof sessions.$inferSelect,
  "id" | "slug" | "title" | "description" | "created_at"
>;
export type PhotoRecord = typeof photos.$inferSelect;
type TagRecord = Pick<Tag, "id" | "name" | "slug">;

export function toTag(row: TagRecord): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

export function toPhotoMetadata(
  row: Pick<PhotoRecord, "iso" | "aperture" | "shutter_speed" | "lens" | "camera">,
) {
  return normalizePhotoMetadata({
    iso: row.iso ?? undefined,
    aperture: row.aperture ?? undefined,
    shutterSpeed: row.shutter_speed ?? undefined,
    lens: row.lens ?? undefined,
    camera: row.camera ?? undefined,
  });
}

export function toApiPhoto(row: PhotoRecord): ApiPhoto {
  return {
    id: row.id,
    sessionId: row.session_id,
    url: row.url,
    miniature: row.miniature,
    alt: row.alt,
    about: row.about,
    sortOrder: row.sort_order,
    metadata: toPhotoMetadata(row),
  };
}

export function toPhotoRecord(photo: ApiPhoto) {
  return {
    id: photo.id,
    session_id: photo.sessionId,
    url: photo.url,
    miniature: photo.miniature,
    alt: photo.alt,
    about: photo.about,
    sort_order: photo.sortOrder,
    iso: photo.metadata.iso,
    aperture: photo.metadata.aperture,
    shutter_speed: photo.metadata.shutterSpeed,
    lens: photo.metadata.lens,
    camera: photo.metadata.camera,
  };
}

export function toPhotoUpdateRecord(photo: ApiPhoto) {
  const { id, ...photoRecord } = toPhotoRecord(photo);
  void id;
  return photoRecord;
}

export function toApiSession(row: SessionRecord, tags: Tag[], photos?: ApiPhoto[]): ApiSession {
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
