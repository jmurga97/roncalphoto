import { eq, sql } from "drizzle-orm";

import { pendingPhotoUploads, photos } from "../schema";
import { toPhotoColumns } from "./photos.repository";

import type { AppDb } from "../client";
import type { PhotoValues } from "./photos.repository";

export type PendingPhotoUpload = typeof pendingPhotoUploads.$inferSelect;

interface InsertPendingInput {
  idempotencyKey: string;
  requestFingerprint: string;
  photoId: string;
  photo: Omit<PhotoValues, "url" | "miniature">;
}

export async function findByIdempotencyKey(db: AppDb, idempotencyKey: string) {
  const row = await db
    .select()
    .from(pendingPhotoUploads)
    .where(eq(pendingPhotoUploads.idempotencyKey, idempotencyKey))
    .get();

  return row ?? null;
}

export async function findByUploadId(db: AppDb, uploadId: string) {
  const row = await db.select().from(pendingPhotoUploads).where(eq(pendingPhotoUploads.uploadId, uploadId)).get();

  return row ?? null;
}

export async function insertPending(db: AppDb, { photo, ...input }: InsertPendingInput) {
  await db.insert(pendingPhotoUploads).values({ id: crypto.randomUUID(), ...input, ...toPhotoColumns(photo) });
}

export async function attachUploadId(db: AppDb, idempotencyKey: string, uploadId: string) {
  await db
    .update(pendingPhotoUploads)
    .set({ uploadId, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(pendingPhotoUploads.idempotencyKey, idempotencyKey));
}

/** Creates the photo from the pending data and marks the upload finalized, atomically. */
export async function finalize(db: AppDb, pending: PendingPhotoUpload, variants: { url: string; miniature: string }) {
  const { photoId, sessionId, alt, about, sortOrder, iso, aperture, shutterSpeed, lens, camera } = pending;

  await db.batch([
    db
      .insert(photos)
      .values({
        id: photoId,
        sessionId,
        ...variants,
        alt,
        about,
        sortOrder,
        iso,
        aperture,
        shutterSpeed,
        lens,
        camera,
      })
      .onConflictDoNothing({ target: photos.id }),
    db
      .update(pendingPhotoUploads)
      .set({
        status: "finalized",
        updatedAt: sql`CURRENT_TIMESTAMP`,
        finalizedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(pendingPhotoUploads.id, pending.id)),
  ]);
}
