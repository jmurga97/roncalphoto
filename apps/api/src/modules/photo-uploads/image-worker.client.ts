import { HttpError } from "@/shared/errors";

import {
  createWorkerUploadResponseSchema,
  workerErrorResponseSchema,
  workerUploadResultResponseSchema,
} from "./schemas/image-worker.schema";

import type { ImageWorkerRpcBinding } from "@/config/env/schema";
import type { ZodType } from "zod";
import type {
  CreateImageWorkerUploadInput,
  WorkerCreateUploadResult,
  WorkerUploadResult,
} from "@/modules/photo-uploads/types";

const RONCALPHOTO_PRODUCT_ID = "roncalphoto";

const httpStatusByErrorCode: Record<string, 400 | 403 | 404 | 409 | 413 | 415> = {
  UPLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  IDEMPOTENCY_CONFLICT: 409,
  UPLOAD_NOT_RETRYABLE: 409,
  INVALID_BODY: 400,
  INVALID_JSON: 400,
  UPLOAD_NOT_FOUND: 404,
  PRODUCT_NOT_ALLOWED: 403,
  PRESET_NOT_ALLOWED: 403,
};

function mapWorkerError(error: { code: string; message: string; retryable: boolean }): HttpError {
  const status = httpStatusByErrorCode[error.code] ?? (error.retryable ? 503 : 502);
  return new HttpError(status, error.message);
}

async function callWorker(call: () => Promise<unknown>): Promise<unknown> {
  try {
    return await call();
  } catch {
    throw new HttpError(503, "Image service is unavailable");
  }
}

async function readWorkerEnvelope<T>(body: unknown, schema: ZodType<T>): Promise<T> {
  const error = workerErrorResponseSchema.safeParse(body);

  if (error.success) {
    throw mapWorkerError(error.data.error);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new HttpError(502, "Image service returned an invalid response");
  }

  return parsed.data;
}

export class ImageWorkerClient {
  constructor(private readonly worker: ImageWorkerRpcBinding) {}

  async createUpload(input: CreateImageWorkerUploadInput): Promise<WorkerCreateUploadResult> {
    const body = await callWorker(() =>
      this.worker.createUpload({
        productId: RONCALPHOTO_PRODUCT_ID,
        idempotencyKey: input.idempotencyKey,
        upload: {
          presetId: "roncalphoto-portfolio",
          externalId: input.photoId,
          filename: input.file.filename,
          contentType: input.file.contentType,
          sizeBytes: input.file.sizeBytes,
          metadata: {
            source: "photos-admin",
          },
        },
      }),
    );

    const parsed = await readWorkerEnvelope(body, createWorkerUploadResponseSchema);

    return parsed.data;
  }

  async getUpload(uploadId: string): Promise<WorkerUploadResult> {
    const body = await callWorker(() =>
      this.worker.getUpload({ productId: RONCALPHOTO_PRODUCT_ID, uploadId }),
    );
    const parsed = await readWorkerEnvelope(body, workerUploadResultResponseSchema);

    return parsed.data;
  }

  async retryUpload(uploadId: string): Promise<WorkerUploadResult> {
    const body = await callWorker(() =>
      this.worker.retryUpload({ productId: RONCALPHOTO_PRODUCT_ID, uploadId }),
    );
    const parsed = await readWorkerEnvelope(body, workerUploadResultResponseSchema);

    return parsed.data;
  }
}
