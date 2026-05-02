import { NOT_FOUND } from "@/config/status-codes";
import type { D1DatabaseBinding } from "@/config/types";
import { HttpError } from "@/shared/errors/http-error";
import type {
  CreateUploadJobRecord,
  PhotoMetadataInput,
  PhotoUploadJob,
  UploadJobStatus,
} from "./types";

type DbValue = string | number | null;

interface PhotoUploadJobRow {
  id: string;
  photo_id: string;
  session_id: string;
  original_key: string;
  main_key: string;
  thumbnail_key: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  alt: string;
  about: string;
  sort_order: number;
  iso: number | null;
  aperture: string | null;
  shutter_speed: string | null;
  lens: string | null;
  camera: string | null;
  status: UploadJobStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface PhotoUpsertInput {
  id: string;
  sessionId: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sortOrder: number;
  metadata?: PhotoMetadataInput;
}

export interface UploadJobsStore {
  sessionExists(sessionId: string): Promise<boolean>;
  createJob(job: CreateUploadJobRecord): Promise<PhotoUploadJob>;
  getJob(uploadId: string): Promise<PhotoUploadJob | null>;
  getJobOrThrow(uploadId: string): Promise<PhotoUploadJob>;
  listJobs(sessionId?: string): Promise<PhotoUploadJob[]>;
  updateStatus(
    uploadId: string,
    status: UploadJobStatus,
    errorMessage?: string | null,
  ): Promise<void>;
  upsertPhoto(photo: PhotoUpsertInput): Promise<void>;
}

function toNullableText(value: string | undefined): string | null {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function toPhotoUploadJob(row: PhotoUploadJobRow): PhotoUploadJob {
  return {
    id: row.id,
    photoId: row.photo_id,
    sessionId: row.session_id,
    originalKey: row.original_key,
    mainKey: row.main_key,
    thumbnailKey: row.thumbnail_key,
    originalFilename: row.original_filename,
    contentType: row.content_type as PhotoUploadJob["contentType"],
    sizeBytes: row.size_bytes,
    alt: row.alt,
    about: row.about,
    sortOrder: row.sort_order,
    metadata: {
      iso: row.iso ?? undefined,
      aperture: row.aperture ?? undefined,
      shutterSpeed: row.shutter_speed ?? undefined,
      lens: row.lens ?? undefined,
      camera: row.camera ?? undefined,
    },
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

export class UploadJobsRepository implements UploadJobsStore {
  constructor(private readonly db: D1DatabaseBinding) {}

  async sessionExists(sessionId: string): Promise<boolean> {
    const row = await this.db
      .prepare("SELECT id FROM sessions WHERE id = ? LIMIT 1")
      .bind(sessionId)
      .first<{ id: string }>();

    return Boolean(row);
  }

  async createJob(job: CreateUploadJobRecord): Promise<PhotoUploadJob> {
    await this.db
      .prepare(
        `INSERT INTO photo_upload_jobs (
          id,
          photo_id,
          session_id,
          original_key,
          main_key,
          thumbnail_key,
          original_filename,
          content_type,
          size_bytes,
          alt,
          about,
          sort_order,
          iso,
          aperture,
          shutter_speed,
          lens,
          camera,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'awaiting_upload')`,
      )
      .bind(
        job.id,
        job.photoId,
        job.sessionId,
        job.originalKey,
        job.mainKey,
        job.thumbnailKey,
        job.originalFilename,
        job.contentType,
        job.sizeBytes,
        job.alt,
        job.about,
        job.sortOrder,
        job.metadata?.iso ?? null,
        toNullableText(job.metadata?.aperture),
        toNullableText(job.metadata?.shutterSpeed),
        toNullableText(job.metadata?.lens),
        toNullableText(job.metadata?.camera),
      )
      .run();

    return this.getJobOrThrow(job.id);
  }

  async getJob(uploadId: string): Promise<PhotoUploadJob | null> {
    const row = await this.db
      .prepare("SELECT * FROM photo_upload_jobs WHERE id = ? LIMIT 1")
      .bind(uploadId)
      .first<PhotoUploadJobRow>();

    return row ? toPhotoUploadJob(row) : null;
  }

  async getJobOrThrow(uploadId: string): Promise<PhotoUploadJob> {
    const job = await this.getJob(uploadId);

    if (!job) {
      throw new HttpError(NOT_FOUND, "Upload job not found");
    }

    return job;
  }

  async listJobs(sessionId?: string): Promise<PhotoUploadJob[]> {
    const statement = sessionId
      ? this.db
          .prepare("SELECT * FROM photo_upload_jobs WHERE session_id = ? ORDER BY created_at DESC")
          .bind(sessionId)
      : this.db.prepare("SELECT * FROM photo_upload_jobs ORDER BY created_at DESC");
    const { results } = await statement.all<PhotoUploadJobRow>();

    return results.map(toPhotoUploadJob);
  }

  async updateStatus(uploadId: string, status: UploadJobStatus, errorMessage?: string | null) {
    const completedAtExpression = status === "done" ? "CURRENT_TIMESTAMP" : "NULL";
    const normalizedError = status === "error" ? (errorMessage ?? "Image processing failed") : null;

    await this.db
      .prepare(
        `UPDATE photo_upload_jobs
         SET status = ?,
             error_message = ?,
             updated_at = CURRENT_TIMESTAMP,
             completed_at = ${completedAtExpression}
         WHERE id = ?`,
      )
      .bind(status, normalizedError, uploadId)
      .run();
  }

  async upsertPhoto(photo: PhotoUpsertInput) {
    const values: DbValue[] = [
      photo.id,
      photo.sessionId,
      photo.url,
      photo.miniature,
      photo.alt,
      photo.about,
      photo.sortOrder,
      photo.metadata?.iso ?? null,
      toNullableText(photo.metadata?.aperture),
      toNullableText(photo.metadata?.shutterSpeed),
      toNullableText(photo.metadata?.lens),
      toNullableText(photo.metadata?.camera),
    ];

    await this.db
      .prepare(
        `INSERT INTO photos (
          id,
          session_id,
          url,
          miniature,
          alt,
          about,
          sort_order,
          iso,
          aperture,
          shutter_speed,
          lens,
          camera
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          session_id = excluded.session_id,
          url = excluded.url,
          miniature = excluded.miniature,
          alt = excluded.alt,
          about = excluded.about,
          sort_order = excluded.sort_order,
          iso = excluded.iso,
          aperture = excluded.aperture,
          shutter_speed = excluded.shutter_speed,
          lens = excluded.lens,
          camera = excluded.camera`,
      )
      .bind(...values)
      .run();
  }
}
