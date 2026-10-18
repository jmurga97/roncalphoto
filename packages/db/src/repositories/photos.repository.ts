import { asc, count, eq, like, or } from "drizzle-orm";

import { toPhoto } from "../mappers";
import { photos, sessions } from "../schema";

import type { AppDb } from "../client";

type PhotoColumns = Omit<typeof photos.$inferInsert, "id">;
type MetadataColumn = "iso" | "aperture" | "shutterSpeed" | "lens" | "camera";

/** Write shape mirroring the read shape: metadata stays nested; `null` clears a field. */
export type PhotoValues = Omit<PhotoColumns, MetadataColumn> & {
  metadata?: Partial<Pick<PhotoColumns, MetadataColumn>>;
};

export function toPhotoColumns<T extends Partial<PhotoValues>>({ metadata, ...photo }: T) {
  return { ...photo, ...metadata };
}

export async function list(db: AppDb, { limit, offset, search }: { limit: number; offset: number; search: string }) {
  const where = search
    ? or(
        like(photos.alt, `%${search}%`),
        like(photos.about, `%${search}%`),
        like(photos.url, `%${search}%`),
        like(sessions.title, `%${search}%`),
      )
    : undefined;
  const [rows, totalRow] = await Promise.all([
    db
      .select({ photo: photos })
      .from(photos)
      .innerJoin(sessions, eq(photos.sessionId, sessions.id))
      .where(where)
      .orderBy(asc(photos.sessionId), asc(photos.sortOrder), asc(photos.id))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(photos)
      .innerJoin(sessions, eq(photos.sessionId, sessions.id))
      .where(where)
      .get(),
  ]);

  return { items: rows.map(({ photo }) => toPhoto(photo)), total: totalRow?.total ?? 0 };
}

export async function findById(db: AppDb, id: string) {
  const row = await db.select().from(photos).where(eq(photos.id, id)).get();

  return row ? toPhoto(row) : null;
}

export async function update(db: AppDb, id: string, values: Partial<PhotoValues>) {
  const row = await db.update(photos).set(toPhotoColumns(values)).where(eq(photos.id, id)).returning().get();

  return row ? toPhoto(row) : null;
}

export async function remove(db: AppDb, id: string) {
  const row = await db.delete(photos).where(eq(photos.id, id)).returning({ id: photos.id }).get();

  return row ?? null;
}
