import { z } from "@hono/zod-openapi";

import { apiPhotoSchema } from "@/shared/lib/contracts";
import { createSuccessResponseSchema } from "@/shared/lib/http";

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
});

const photoUploadStatusSchema = z.enum([
  "awaiting_upload",
  "queued",
  "processing",
  "succeeded",
  "failed",
]);

const signedUploadSchema = z
  .object({
    url: z.string(),
    expiresAt: z.string(),
    headers: z.object({
      "Content-Type": z.string(),
    }),
  })
  .nullable();

export const createPhotoUploadResponseSchema = createSuccessResponseSchema(
  z.object({
    uploadId: z.string().uuid(),
    photoId: z.string().uuid(),
    status: photoUploadStatusSchema,
    upload: signedUploadSchema,
  }),
).openapi("CreatePhotoUploadResponse");

export const photoUploadStatusResponseSchema = createSuccessResponseSchema(
  z.object({
    uploadId: z.string().uuid(),
    photoId: z.string().uuid(),
    status: photoUploadStatusSchema,
    attempts: z.number().int().nonnegative(),
    originalRetentionStatus: z.enum(["pending", "retained", "deleted", "delete_failed"]),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        retryable: z.boolean(),
      })
      .nullable(),
    photo: apiPhotoSchema.nullable(),
  }),
).openapi("PhotoUploadStatusResponse");
