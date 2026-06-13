import { z } from "zod";

export const workerErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean(),
  }),
});

const workerUploadStatusSchema = z.enum([
  "awaiting_upload",
  "queued",
  "processing",
  "succeeded",
  "failed",
]);

const workerImageVariantSchema = z.object({
  name: z.string(),
  bucket: z.string(),
  key: z.string(),
  publicUrl: z.string().nullable(),
  contentType: z.string(),
  width: z.number(),
  height: z.number(),
  sizeBytes: z.number(),
});

const workerUploadResultSchema = z.object({
  uploadId: z.string(),
  productId: z.string(),
  presetId: z.string(),
  externalId: z.string().nullable(),
  status: workerUploadStatusSchema,
  attempts: z.number(),
  originalRetentionStatus: z.enum(["pending", "retained", "deleted", "delete_failed"]),
  manifest: z
    .object({
      source: z.object({
        contentType: z.string(),
        width: z.number(),
        height: z.number(),
        sizeBytes: z.number(),
      }),
      variants: z.record(z.string(), workerImageVariantSchema),
    })
    .nullable(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      retryable: z.boolean(),
    })
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
});

export const createWorkerUploadResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    uploadId: z.string(),
    status: workerUploadStatusSchema,
    upload: z
      .object({
        url: z.string(),
        expiresAt: z.string(),
        headers: z.object({
          "Content-Type": z.string(),
        }),
      })
      .nullable(),
  }),
});

export const workerUploadResultResponseSchema = z.object({
  success: z.literal(true),
  data: workerUploadResultSchema,
});
