import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { sessions } from "./portfolio";

// Legacy: written by the retired `roncalphoto-image-optimizer` Worker; no code in this repo uses it.
// Drop it in a migration once that Worker is deleted from Cloudflare.
export const photoUploadJobs = sqliteTable(
  "photo_upload_jobs",
  {
    id: text("id").primaryKey(),
    photoId: text("photo_id").notNull(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    originalKey: text("original_key").notNull(),
    mainKey: text("main_key").notNull(),
    thumbnailKey: text("thumbnail_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    alt: text("alt").notNull(),
    about: text("about").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    iso: integer("iso"),
    aperture: text("aperture"),
    shutterSpeed: text("shutter_speed"),
    lens: text("lens"),
    camera: text("camera"),
    status: text("status", { enum: ["awaiting_upload", "queued", "processing", "done", "error"] })
      .notNull()
      .default("awaiting_upload"),
    errorMessage: text("error_message"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    completedAt: text("completed_at"),
  },
  (table) => [
    uniqueIndex("photo_upload_jobs_photo_id_unique").on(table.photoId),
    index("idx_photo_upload_jobs_session").on(table.sessionId),
    index("idx_photo_upload_jobs_status").on(table.status),
  ],
);

// Photo data captured when an upload starts; turned into a `photos` row once
// ming-image-worker reports the variants as ready.
export const pendingPhotoUploads = sqliteTable(
  "pending_photo_uploads",
  {
    id: text("id").primaryKey(),
    uploadId: text("upload_id"),
    idempotencyKey: text("idempotency_key").notNull(),
    requestFingerprint: text("request_fingerprint").notNull(),
    photoId: text("photo_id").notNull(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    alt: text("alt").notNull(),
    about: text("about").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    iso: integer("iso"),
    aperture: text("aperture"),
    shutterSpeed: text("shutter_speed"),
    lens: text("lens"),
    camera: text("camera"),
    status: text("status", { enum: ["pending", "finalized"] })
      .notNull()
      .default("pending"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    finalizedAt: text("finalized_at"),
  },
  (table) => [
    uniqueIndex("pending_photo_uploads_upload_id_unique").on(table.uploadId),
    uniqueIndex("pending_photo_uploads_idempotency_unique").on(table.idempotencyKey),
    uniqueIndex("pending_photo_uploads_photo_id_unique").on(table.photoId),
    index("pending_photo_uploads_session_idx").on(table.sessionId),
  ],
);
