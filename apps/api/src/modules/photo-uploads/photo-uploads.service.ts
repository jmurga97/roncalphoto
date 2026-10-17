import * as photoUploadsRepository from "@roncal/db/repositories/photo-uploads.repository";
import * as photosRepository from "@roncal/db/repositories/photos.repository";
import { TRPCError } from "@trpc/server";

import { createImageUpload, getImageUpload, retryImageUpload } from "./image-worker.client";
import { orNotFound } from "../../shared/errors";

import type { ImageUpload } from "./image-worker.client";
import type { CreatePhotoUploadInput } from "./photo-uploads-input.schema";
import type { ImageWorkerBinding } from "../../config/env";
import type { AppDb } from "@roncal/db/client";

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function variantUrl(upload: ImageUpload, variant: "main" | "thumbnail"): string {
  const url = upload.manifest?.variants[variant]?.publicUrl;

  if (!url) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `Image service did not return the ${variant} variant`,
    });
  }

  return url;
}

export async function createPhotoUpload(
  db: AppDb,
  worker: ImageWorkerBinding,
  { idempotencyKey, data }: CreatePhotoUploadInput,
) {
  const { filename, contentType, sizeBytes, ...photo } = data;
  const requestFingerprint = await sha256(JSON.stringify(data));
  const existing = await photoUploadsRepository.findByIdempotencyKey(db, idempotencyKey);

  if (existing && existing.requestFingerprint !== requestFingerprint) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Idempotency key already used with a different request",
    });
  }

  const photoId = existing?.photoId ?? crypto.randomUUID();

  if (!existing) {
    await photoUploadsRepository.insertPending(db, {
      idempotencyKey,
      requestFingerprint,
      photoId,
      photo,
    });
  }

  const created = await createImageUpload(worker, {
    idempotencyKey,
    photoId,
    filename,
    contentType,
    sizeBytes,
  });

  if (!existing?.uploadId) {
    await photoUploadsRepository.attachUploadId(db, idempotencyKey, created.uploadId);
  }

  return { uploadId: created.uploadId, photoId, status: created.status, upload: created.upload };
}

export async function getPhotoUpload(db: AppDb, worker: ImageWorkerBinding, uploadId: string) {
  const pending = orNotFound(await photoUploadsRepository.findByUploadId(db, uploadId), "Photo upload");
  const upload = await getImageUpload(worker, uploadId);

  // Finalize only once: a later poll must not resurrect a photo deleted after the upload.
  if (pending.status === "pending" && upload.status === "succeeded") {
    await photoUploadsRepository.finalize(db, pending, {
      url: variantUrl(upload, "main"),
      miniature: variantUrl(upload, "thumbnail"),
    });
  }

  return {
    uploadId,
    photoId: pending.photoId,
    status: upload.status,
    error: upload.error,
    photo: upload.status === "succeeded" ? await photosRepository.findById(db, pending.photoId) : null,
  };
}

export async function retryPhotoUpload(db: AppDb, worker: ImageWorkerBinding, uploadId: string) {
  orNotFound(await photoUploadsRepository.findByUploadId(db, uploadId), "Photo upload");
  await retryImageUpload(worker, uploadId);

  return getPhotoUpload(db, worker, uploadId);
}
