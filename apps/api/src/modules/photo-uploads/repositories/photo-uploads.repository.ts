import { eq } from "drizzle-orm";

import { getDb, pendingPhotoUploads, photos, sessions } from "@/db";
import { toApiPhoto } from "@/shared/lib/api-mappers";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";

import type { CreatePhotoUploadInput } from "../types";
import type { AppDb, DbExecutor } from "@/db";
import type { ApiPhoto } from "@roncal/shared";

export type PendingPhotoUpload = typeof pendingPhotoUploads.$inferSelect;

export interface CreatePendingPhotoUploadInput extends CreatePhotoUploadInput {
  id: string;
  photoId: string;
  idempotencyKey: string;
  requestFingerprint: string;
}

export interface PhotoUploadsStore {
  sessionExists(sessionId: string): Promise<boolean>;
  findByIdempotencyKey(idempotencyKey: string): Promise<PendingPhotoUpload | null>;
  findByUploadId(uploadId: string): Promise<PendingPhotoUpload | null>;
  createPending(input: CreatePendingPhotoUploadInput): Promise<void>;
  attachUpload(idempotencyKey: string, uploadId: string): Promise<void>;
  getPhoto(photoId: string): Promise<ApiPhoto | null>;
  finalize(
    pending: PendingPhotoUpload,
    urls: { url: string; miniature: string },
  ): Promise<ApiPhoto>;
}

export class PhotoUploadsRepository implements PhotoUploadsStore {
  constructor(private readonly db: AppDb) {}

  async sessionExists(sessionId: string): Promise<boolean> {
    const row = await this.db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .get();
    return Boolean(row);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<PendingPhotoUpload | null> {
    return (
      (await this.db
        .select()
        .from(pendingPhotoUploads)
        .where(eq(pendingPhotoUploads.idempotency_key, idempotencyKey))
        .get()) ?? null
    );
  }

  async findByUploadId(uploadId: string): Promise<PendingPhotoUpload | null> {
    return (
      (await this.db
        .select()
        .from(pendingPhotoUploads)
        .where(eq(pendingPhotoUploads.upload_id, uploadId))
        .get()) ?? null
    );
  }

  async createPending(input: CreatePendingPhotoUploadInput): Promise<void> {
    await this.db.insert(pendingPhotoUploads).values({
      id: input.id,
      idempotency_key: input.idempotencyKey,
      request_fingerprint: input.requestFingerprint,
      photo_id: input.photoId,
      session_id: input.sessionId,
      alt: input.alt,
      about: input.about,
      sort_order: input.sortOrder ?? 0,
      iso: input.metadata?.iso ?? null,
      aperture: input.metadata?.aperture ?? null,
      shutter_speed: input.metadata?.shutterSpeed ?? null,
      lens: input.metadata?.lens ?? null,
      camera: input.metadata?.camera ?? null,
    });
  }

  async attachUpload(idempotencyKey: string, uploadId: string): Promise<void> {
    await this.db
      .update(pendingPhotoUploads)
      .set({
        upload_id: uploadId,
        updated_at: new Date().toISOString(),
      })
      .where(eq(pendingPhotoUploads.idempotency_key, idempotencyKey));
  }

  async getPhoto(photoId: string): Promise<ApiPhoto | null> {
    const row = await this.db.select().from(photos).where(eq(photos.id, photoId)).get();
    return row ? toApiPhoto(row) : null;
  }

  async finalize(
    pending: PendingPhotoUpload,
    urls: { url: string; miniature: string },
  ): Promise<ApiPhoto> {
    await this.db.transaction(async (transaction) => {
      await this.insertPhoto(pending, urls, transaction);
      await transaction
        .update(pendingPhotoUploads)
        .set({
          status: "finalized",
          updated_at: new Date().toISOString(),
          finalized_at: new Date().toISOString(),
        })
        .where(eq(pendingPhotoUploads.id, pending.id));
    });

    const photo = await this.getPhoto(pending.photo_id);

    if (!photo) {
      throw new Error("Finalized photo could not be loaded");
    }

    return photo;
  }

  private async insertPhoto(
    pending: PendingPhotoUpload,
    urls: { url: string; miniature: string },
    executor: DbExecutor,
  ): Promise<void> {
    await executor
      .insert(photos)
      .values({
        id: pending.photo_id,
        session_id: pending.session_id,
        url: urls.url,
        miniature: urls.miniature,
        alt: pending.alt,
        about: pending.about,
        sort_order: pending.sort_order,
        iso: pending.iso,
        aperture: pending.aperture,
        shutter_speed: pending.shutter_speed,
        lens: pending.lens,
        camera: pending.camera,
      })
      .onConflictDoNothing({ target: photos.id });
  }
}

const instances = new WeakMap<D1Database, PhotoUploadsRepository>();

export function getPhotoUploadsRepository(client: D1Database): PhotoUploadsRepository {
  return getOrCreateInstance(instances, client, () => new PhotoUploadsRepository(getDb(client)));
}
