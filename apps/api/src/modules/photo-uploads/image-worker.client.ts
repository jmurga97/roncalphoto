import { HttpError } from "@/shared/errors";

import {
  createWorkerUploadResponseSchema,
  workerUploadResultResponseSchema,
} from "./schemas/image-worker.schema";
import { readImageWorkerResponse } from "./utils/read-image-worker-response";

import type { ImageWorkerServiceBinding } from "@/config/env/schema";
import type {
  CreateImageWorkerUploadInput,
  WorkerCreateUploadResult,
  WorkerUploadResult,
} from "@/modules/photo-uploads/types";

export class ImageWorkerClient {
  constructor(private readonly worker: ImageWorkerServiceBinding) {}

  async createUpload(input: CreateImageWorkerUploadInput): Promise<WorkerCreateUploadResult> {
    const response = await this.fetch("/v1/uploads?productId=roncalphoto", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": input.idempotencyKey,
      },
      body: JSON.stringify({
        presetId: "roncalphoto-portfolio",
        externalId: input.photoId,
        filename: input.file.filename,
        contentType: input.file.contentType,
        sizeBytes: input.file.sizeBytes,
        metadata: {
          source: "photos-admin",
        },
      }),
    });
    const result = await readImageWorkerResponse(response, createWorkerUploadResponseSchema);
    return result.data;
  }

  async getUpload(uploadId: string): Promise<WorkerUploadResult> {
    const response = await this.fetch(
      `/v1/uploads/${encodeURIComponent(uploadId)}?productId=roncalphoto`,
    );
    const result = await readImageWorkerResponse(response, workerUploadResultResponseSchema);
    return result.data;
  }

  async retryUpload(uploadId: string): Promise<WorkerUploadResult> {
    const response = await this.fetch(
      `/v1/uploads/${encodeURIComponent(uploadId)}/retry?productId=roncalphoto`,
      { method: "POST" },
    );
    const result = await readImageWorkerResponse(response, workerUploadResultResponseSchema);
    return result.data;
  }

  private async fetch(path: string, init?: RequestInit): Promise<Response> {
    try {
      return await this.worker.fetch(`https://image-worker.internal${path}`, init);
    } catch {
      throw new HttpError(503, "Image service is unavailable");
    }
  }
}
