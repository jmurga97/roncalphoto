import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { ImageWorkerBinding } from "../../config/env";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";

const PRODUCT_ID = "roncalphoto";
const PRESET_ID = "roncalphoto-portfolio";

const uploadStatus = z.enum(["awaiting_upload", "queued", "processing", "succeeded", "failed"]);
const workerError = z.object({ code: z.string(), message: z.string(), retryable: z.boolean() });
const failureEnvelope = z.object({ success: z.literal(false), error: workerError });

const uploadHeaders = z.record(z.string(), z.string());
const variants = z.record(z.string(), z.object({ publicUrl: z.string().nullable() }));

const signedUploadSchema = z.object({
  uploadId: z.string(),
  status: uploadStatus,
  upload: z.object({ url: z.string(), expiresAt: z.string(), headers: uploadHeaders }).nullable(),
});

const uploadSchema = z.object({
  uploadId: z.string(),
  status: uploadStatus,
  error: workerError.nullable(),
  manifest: z.object({ variants }).nullable(),
});

export type ImageUpload = z.infer<typeof uploadSchema>;

const ERROR_CODES: Record<string, TRPC_ERROR_CODE_KEY> = {
  UPLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
  IDEMPOTENCY_CONFLICT: "CONFLICT",
  UPLOAD_NOT_RETRYABLE: "CONFLICT",
  INVALID_BODY: "BAD_REQUEST",
  INVALID_JSON: "BAD_REQUEST",
  UPLOAD_NOT_FOUND: "NOT_FOUND",
  PRODUCT_NOT_ALLOWED: "FORBIDDEN",
  PRESET_NOT_ALLOWED: "FORBIDDEN",
};

/** Calls the worker and unwraps its `{ success, data | error }` envelope into data or a TRPCError. */
async function callWorker<T>(request: () => Promise<unknown>, data: z.ZodType<T>): Promise<T> {
  let body: unknown;

  try {
    body = await request();
  } catch (error) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Image service is unavailable",
      cause: error,
    });
  }

  const failure = failureEnvelope.safeParse(body);

  if (failure.success) {
    const { code, message, retryable } = failure.data.error;

    throw new TRPCError({
      code: ERROR_CODES[code] ?? (retryable ? "SERVICE_UNAVAILABLE" : "BAD_GATEWAY"),
      message,
    });
  }

  const parsed = z.object({ success: z.literal(true), data }).safeParse(body);

  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "Image service returned an invalid response",
    });
  }

  return parsed.data.data;
}

interface CreateImageUploadInput {
  idempotencyKey: string;
  photoId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export function createImageUpload(
  worker: ImageWorkerBinding,
  { idempotencyKey, photoId, ...file }: CreateImageUploadInput,
) {
  return callWorker(
    () =>
      worker.createUpload({
        productId: PRODUCT_ID,
        idempotencyKey,
        upload: {
          presetId: PRESET_ID,
          externalId: photoId,
          ...file,
          metadata: { source: "photos-admin" },
        },
      }),
    signedUploadSchema,
  );
}

export function getImageUpload(worker: ImageWorkerBinding, uploadId: string) {
  return callWorker(() => worker.getUpload({ productId: PRODUCT_ID, uploadId }), uploadSchema);
}

export function retryImageUpload(worker: ImageWorkerBinding, uploadId: string) {
  return callWorker(() => worker.retryUpload({ productId: PRODUCT_ID, uploadId }), uploadSchema);
}
