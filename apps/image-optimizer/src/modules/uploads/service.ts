import type { RuntimeEnv } from "@/config/env";
import { BAD_REQUEST, CONFLICT, UNSUPPORTED_MEDIA_TYPE } from "@/config/status-codes";
import type { QueueBinding, R2BucketBinding, UploadQueueMessage } from "@/config/types";
import { CloudflareImagesEngine } from "@/modules/images/engine";
import { portfolioMainProfile, portfolioThumbnailProfile } from "@/modules/images/profiles";
import { acceptedImageMimeTypes } from "@/modules/images/types";
import { HttpError } from "@/shared/errors/http-error";
import { createPublicMediaUrl, createUploadObjectKeys } from "./keys";
import { UploadJobsRepository, type UploadJobsStore } from "./repository";
import { createPresignedR2PutUrl } from "./signing";
import type {
  CreateUploadInput,
  CreateUploadJobRecord,
  ImageProcessingMessage,
  PhotoUploadJob,
  PresignedUpload,
  UploadJobProgress,
  UploadJobsResponse,
} from "./types";

const permanentProcessingErrorMessage = "Image must be JPEG, PNG, or WebP";

function generateId(): string {
  return crypto.randomUUID();
}

function createQueueMessage(job: PhotoUploadJob): UploadQueueMessage {
  return {
    uploadId: job.id,
    photoId: job.photoId,
    sessionId: job.sessionId,
    originalKey: job.originalKey,
    mainKey: job.mainKey,
    thumbnailKey: job.thumbnailKey,
  };
}

function createProgress(jobs: PhotoUploadJob[]): UploadJobProgress {
  return jobs.reduce<UploadJobProgress>(
    (progress, job) => {
      progress.total += 1;

      if (job.status === "awaiting_upload") {
        progress.awaitingUpload += 1;
      } else {
        progress[job.status] += 1;
      }

      return progress;
    },
    {
      total: 0,
      awaitingUpload: 0,
      queued: 0,
      processing: 0,
      done: 0,
      error: 0,
    },
  );
}

function normalizeProcessingError(error: unknown): string {
  if (error instanceof HttpError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.slice(0, 500);
  }

  return "Image processing failed";
}

function assertSupportedImageFormat(format: string) {
  if (
    !acceptedImageMimeTypes.includes(
      format.toLowerCase() as (typeof acceptedImageMimeTypes)[number],
    )
  ) {
    throw new HttpError(UNSUPPORTED_MEDIA_TYPE, permanentProcessingErrorMessage);
  }
}

async function getRequiredR2Object(
  bucket: R2BucketBinding,
  key: string,
): Promise<Awaited<ReturnType<R2BucketBinding["get"]>> & { body: ReadableStream<Uint8Array> }> {
  const object = await bucket.get(key);
  const body = object?.body;

  if (!object || !body) {
    throw new HttpError(BAD_REQUEST, "Original image was not found in R2");
  }

  return {
    ...object,
    body,
  };
}

export class UploadsService {
  constructor(
    private readonly env: RuntimeEnv,
    private readonly repository: UploadJobsStore,
    private readonly originalsBucket: R2BucketBinding,
    private readonly mediaBucket: R2BucketBinding,
    private readonly queue: QueueBinding,
    private readonly engine = new CloudflareImagesEngine(env.IMAGES),
  ) {}

  async createUploads(input: CreateUploadInput): Promise<PresignedUpload[]> {
    const sessionExists = await this.repository.sessionExists(input.sessionId);

    if (!sessionExists) {
      throw new HttpError(BAD_REQUEST, "Session not found");
    }

    const uploads: PresignedUpload[] = [];

    for (const [index, file] of input.files.entries()) {
      const uploadId = generateId();
      const photoId = generateId();
      const keys = createUploadObjectKeys({
        filename: file.filename,
        photoId,
        sessionId: input.sessionId,
      });
      const jobInput: CreateUploadJobRecord = {
        id: uploadId,
        photoId,
        sessionId: input.sessionId,
        originalFilename: file.filename,
        contentType: file.contentType,
        sizeBytes: file.sizeBytes,
        alt: file.alt,
        about: file.about,
        sortOrder: file.sortOrder ?? index,
        metadata: file.metadata,
        ...keys,
      };
      await this.repository.createJob(jobInput);
      const signedUpload = await createPresignedR2PutUrl(
        this.env,
        keys.originalKey,
        file.contentType,
      );

      uploads.push({
        uploadId,
        photoId,
        uploadUrl: signedUpload.uploadUrl,
        originalKey: keys.originalKey,
        mainKey: keys.mainKey,
        thumbnailKey: keys.thumbnailKey,
        expiresAt: signedUpload.expiresAt,
        headers: {
          "Content-Type": file.contentType,
        },
      });
    }

    return uploads;
  }

  async completeUploads(uploadIds: string[]): Promise<UploadJobsResponse> {
    const jobs: PhotoUploadJob[] = [];

    for (const uploadId of uploadIds) {
      const job = await this.repository.getJobOrThrow(uploadId);

      if (job.status === "done" || job.status === "queued" || job.status === "processing") {
        jobs.push(job);
        continue;
      }

      if (job.status === "error") {
        throw new HttpError(CONFLICT, `Upload ${uploadId} must be retried explicitly`);
      }

      const uploadedObject = await this.originalsBucket.head(job.originalKey);

      if (!uploadedObject) {
        throw new HttpError(BAD_REQUEST, `Original image is missing for upload ${uploadId}`);
      }

      await this.repository.updateStatus(uploadId, "queued");
      const queuedJob = await this.repository.getJobOrThrow(uploadId);
      await this.queue.send(createQueueMessage(queuedJob));
      jobs.push(queuedJob);
    }

    return {
      jobs,
      progress: createProgress(jobs),
    };
  }

  async listUploads(sessionId?: string): Promise<UploadJobsResponse> {
    const jobs = await this.repository.listJobs(sessionId);

    return {
      jobs,
      progress: createProgress(jobs),
    };
  }

  async retryUpload(uploadId: string): Promise<PhotoUploadJob> {
    const job = await this.repository.getJobOrThrow(uploadId);

    if (job.status !== "error") {
      throw new HttpError(CONFLICT, "Only failed upload jobs can be retried");
    }

    const uploadedObject = await this.originalsBucket.head(job.originalKey);

    if (!uploadedObject) {
      throw new HttpError(BAD_REQUEST, "Original image is missing in R2");
    }

    await this.repository.updateStatus(uploadId, "queued");
    const queuedJob = await this.repository.getJobOrThrow(uploadId);
    await this.queue.send(createQueueMessage(queuedJob));

    return queuedJob;
  }

  async processMessage(message: ImageProcessingMessage): Promise<void> {
    const job = await this.repository.getJob(message.uploadId);

    if (!job || job.status === "done") {
      return;
    }

    await this.repository.updateStatus(job.id, "processing");

    try {
      await this.processJob(job);
      await this.repository.updateStatus(job.id, "done");
    } catch (error) {
      await this.repository.updateStatus(job.id, "error", normalizeProcessingError(error));
    }
  }

  private async processJob(job: PhotoUploadJob): Promise<void> {
    const infoObject = await getRequiredR2Object(this.originalsBucket, job.originalKey);
    const info = await this.engine.readInfo(infoObject.body, infoObject.size);
    assertSupportedImageFormat(info.format);

    const mainObject = await getRequiredR2Object(this.originalsBucket, job.originalKey);
    const mainImage = await this.engine.transform(mainObject.body, portfolioMainProfile);
    await this.mediaBucket.put(job.mainKey, mainImage.bytes, {
      httpMetadata: {
        contentType: mainImage.contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    const thumbnailObject = await getRequiredR2Object(this.originalsBucket, job.originalKey);
    const thumbnailImage = await this.engine.transform(
      thumbnailObject.body,
      portfolioThumbnailProfile,
    );
    await this.mediaBucket.put(job.thumbnailKey, thumbnailImage.bytes, {
      httpMetadata: {
        contentType: thumbnailImage.contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    await this.repository.upsertPhoto({
      id: job.photoId,
      sessionId: job.sessionId,
      url: createPublicMediaUrl(this.env.PUBLIC_MEDIA_BASE_URL, job.mainKey),
      miniature: createPublicMediaUrl(this.env.PUBLIC_MEDIA_BASE_URL, job.thumbnailKey),
      alt: job.alt,
      about: job.about,
      sortOrder: job.sortOrder,
      metadata: job.metadata,
    });
  }
}

export function createUploadsService(env: RuntimeEnv): UploadsService {
  return new UploadsService(
    env,
    new UploadJobsRepository(env.DB_RONCALPHOTO),
    env.ORIGINALS_BUCKET,
    env.MEDIA_BUCKET,
    env.IMAGE_PROCESSING_QUEUE,
  );
}
