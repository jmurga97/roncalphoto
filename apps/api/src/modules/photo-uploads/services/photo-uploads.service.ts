import { HttpError } from "@/shared/errors";
import { generateId } from "@/shared/utils/id";

import { ImageWorkerClient } from "../image-worker.client";
import { getPhotoUploadsRepository } from "../repositories/photo-uploads.repository";

import type { PhotoUploadsStore } from "../repositories/photo-uploads.repository";
import type {
  CreateImageWorkerUploadInput,
  CreatePhotoUploadInput,
  WorkerCreateUploadResult,
  WorkerUploadResult,
} from "../types";
import type { ImageWorkerServiceBinding } from "@/config/env/schema";
import type { ApiPhoto, CreatePhotoUploadResult, PhotoUploadStatusResult } from "@roncal/shared";

async function createRequestFingerprint(input: CreatePhotoUploadInput): Promise<string> {
  const normalized = {
    sessionId: input.sessionId,
    filename: input.filename,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    alt: input.alt,
    about: input.about,
    sortOrder: input.sortOrder ?? 0,
    metadata: {
      iso: input.metadata?.iso ?? null,
      aperture: input.metadata?.aperture ?? null,
      shutterSpeed: input.metadata?.shutterSpeed ?? null,
      lens: input.metadata?.lens ?? null,
      camera: input.metadata?.camera ?? null,
    },
  };
  const bytes = new TextEncoder().encode(JSON.stringify(normalized));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function requireVariantUrl(result: WorkerUploadResult, name: string): string {
  const url = result.manifest?.variants[name]?.publicUrl;

  if (!url) {
    throw new HttpError(502, `Image service did not return the ${name} variant URL`);
  }

  return url;
}

export interface ImageWorkerGateway {
  createUpload(input: CreateImageWorkerUploadInput): Promise<WorkerCreateUploadResult>;
  getUpload(uploadId: string): Promise<WorkerUploadResult>;
  retryUpload(uploadId: string): Promise<WorkerUploadResult>;
}

export class PhotoUploadsService {
  constructor(
    private readonly repository: PhotoUploadsStore,
    private readonly imageWorker: ImageWorkerGateway,
  ) {}

  async createUpload(
    idempotencyKey: string,
    input: CreatePhotoUploadInput,
  ): Promise<CreatePhotoUploadResult> {
    if (!(await this.repository.sessionExists(input.sessionId))) {
      throw new HttpError(400, "Session not found");
    }

    const requestFingerprint = await createRequestFingerprint(input);
    const existing = await this.repository.findByIdempotencyKey(idempotencyKey);

    if (existing && existing.request_fingerprint !== requestFingerprint) {
      throw new HttpError(409, "Idempotency-Key was already used with a different request");
    }

    const photoId = existing?.photo_id ?? generateId();

    if (!existing) {
      await this.repository.createPending({
        ...input,
        id: generateId(),
        photoId,
        idempotencyKey,
        requestFingerprint,
      });
    }

    const workerResult = await this.imageWorker.createUpload({
      idempotencyKey,
      photoId,
      file: input,
    });

    if (!existing?.upload_id) {
      await this.repository.attachUpload(idempotencyKey, workerResult.uploadId);
    }

    return {
      uploadId: workerResult.uploadId,
      photoId,
      status: workerResult.status,
      upload: workerResult.upload,
    };
  }

  async getUpload(uploadId: string): Promise<PhotoUploadStatusResult> {
    const pending = await this.repository.findByUploadId(uploadId);

    if (!pending) {
      throw new HttpError(404, "Photo upload not found");
    }

    const workerResult = await this.imageWorker.getUpload(uploadId);
    let photo: ApiPhoto | null = null;

    if (pending.status === "finalized") {
      photo = await this.repository.getPhoto(pending.photo_id);

      if (!photo) {
        throw new HttpError(500, "Finalized photo is missing");
      }
    } else if (workerResult.status === "succeeded") {
      photo = await this.repository.finalize(pending, {
        url: requireVariantUrl(workerResult, "main"),
        miniature: requireVariantUrl(workerResult, "thumbnail"),
      });
    }

    return {
      uploadId,
      photoId: pending.photo_id,
      status: workerResult.status,
      attempts: workerResult.attempts,
      originalRetentionStatus: workerResult.originalRetentionStatus,
      error: workerResult.error,
      photo,
    };
  }

  async retryUpload(uploadId: string): Promise<PhotoUploadStatusResult> {
    const pending = await this.repository.findByUploadId(uploadId);

    if (!pending) {
      throw new HttpError(404, "Photo upload not found");
    }

    await this.imageWorker.retryUpload(uploadId);
    return this.getUpload(uploadId);
  }
}

const serviceInstances = new WeakMap<D1Database, PhotoUploadsService>();

export function getPhotoUploadsService(
  database: D1Database,
  imageWorker: ImageWorkerServiceBinding,
): PhotoUploadsService {
  return (
    serviceInstances.get(database) ??
    (() => {
      const service = new PhotoUploadsService(
        getPhotoUploadsRepository(database),
        new ImageWorkerClient(imageWorker),
      );
      serviceInstances.set(database, service);
      return service;
    })()
  );
}
