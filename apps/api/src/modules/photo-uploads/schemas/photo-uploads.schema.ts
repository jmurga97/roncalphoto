import { z } from "@hono/zod-openapi";

import { apiPhotoSchema } from "@/shared/lib/contracts";
import { createSuccessResponseSchema } from "@/shared/lib/http";

import type {
  CreatePhotoUploadInput,
  CreatePhotoUploadResult,
  PhotoUploadError,
  PhotoUploadStatus,
  PhotoUploadStatusResult,
  SignedPhotoUpload,
} from "@roncal/shared";

export const photoUploadIdParamsSchema = z.object({
  uploadId: z
    .string()
    .trim()
    .uuid()
    .openapi({
      param: {
        name: "uploadId",
        in: "path",
      },
    }),
});

export const photoUploadHeadersSchema = z.object({
  "idempotency-key": z
    .string()
    .trim()
    .min(8)
    .max(160)
    .openapi({
      param: {
        name: "Idempotency-Key",
        in: "header",
      },
    }),
});

export const createPhotoUploadBodySchema = z.object({
  sessionId: z.string().trim().min(1),
  filename: z.string().trim().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024),
  alt: z.string().trim().min(1),
  about: z.string().trim().min(1),
  sortOrder: z.number().int().optional(),
  metadata: z
    .object({
      iso: z.number().int().positive().optional(),
      aperture: z.string().trim().optional(),
      shutterSpeed: z.string().trim().optional(),
      lens: z.string().trim().optional(),
      camera: z.string().trim().optional(),
    })
    .optional(),
}) satisfies z.ZodType<CreatePhotoUploadInput>;

const photoUploadStatusSchema = z.enum([
  "awaiting_upload",
  "queued",
  "processing",
  "succeeded",
  "failed",
]) satisfies z.ZodType<PhotoUploadStatus>;

const signedUploadSchema = z
  .object({
    url: z.string(),
    expiresAt: z.string(),
    headers: z.object({
      "Content-Type": z.string(),
    }),
  })
  .nullable() satisfies z.ZodType<SignedPhotoUpload | null>;

const createPhotoUploadResultSchema = z.object({
  uploadId: z.string().uuid(),
  photoId: z.string().uuid(),
  status: photoUploadStatusSchema,
  upload: signedUploadSchema,
}) satisfies z.ZodType<CreatePhotoUploadResult>;

export const createPhotoUploadResponseSchema = createSuccessResponseSchema(
  createPhotoUploadResultSchema,
).openapi("CreatePhotoUploadResponse");

const photoUploadErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
}) satisfies z.ZodType<PhotoUploadError>;

const photoUploadStatusResultSchema = z.object({
  uploadId: z.string().uuid(),
  photoId: z.string().uuid(),
  status: photoUploadStatusSchema,
  attempts: z.number().int().nonnegative(),
  originalRetentionStatus: z.enum(["pending", "retained", "deleted", "delete_failed"]),
  error: photoUploadErrorSchema.nullable(),
  photo: apiPhotoSchema.nullable(),
}) satisfies z.ZodType<PhotoUploadStatusResult>;

export const photoUploadStatusResponseSchema = createSuccessResponseSchema(
  photoUploadStatusResultSchema,
).openapi("PhotoUploadStatusResponse");
