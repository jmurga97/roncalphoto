import { z } from "zod";

export interface EmailWorkerServiceBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

type ImageWorkerUploadInput = {
  presetId: string;
  externalId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  metadata?: { requestId?: string; source?: string };
};

export interface ImageWorkerRpcBinding {
  createUpload(input: {
    productId: string;
    idempotencyKey: string;
    upload: ImageWorkerUploadInput;
  }): Promise<unknown>;
  getUpload(input: { productId: string; uploadId: string }): Promise<unknown>;
  retryUpload(input: { productId: string; uploadId: string }): Promise<unknown>;
}

export const logLevelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);
export const nodeEnvSchema = z.enum(["development", "test", "production"]);

export const publicEnvSchema = z.object({
  DB_RONCALPHOTO: z.custom<D1Database>((value) => typeof value === "object" && value !== null, {
    error: "DB_RONCALPHOTO binding is required",
  }),
  IMAGE_WORKER: z.custom<ImageWorkerRpcBinding>(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      typeof (value as { createUpload?: unknown }).createUpload === "function" &&
      typeof (value as { getUpload?: unknown }).getUpload === "function" &&
      typeof (value as { retryUpload?: unknown }).retryUpload === "function",
    "IMAGE_WORKER service binding must implement the ImageRpc entrypoint",
  ),
  ALLOWED_ORIGINS: z.string().trim().optional(),
  LOG_LEVEL: logLevelSchema.default("info"),
  NODE_ENV: nodeEnvSchema.default("development"),
});

export const authEnvSchema = z
  .object({
    BETTER_AUTH_SECRET: z.string().trim().min(1),
    BETTER_AUTH_URL: z.string().trim().min(1),
    EMAIL_WORKER: z
      .custom<EmailWorkerServiceBinding>(
        (value) =>
          typeof value === "object" &&
          value !== null &&
          typeof (value as { fetch?: unknown }).fetch === "function",
        "EMAIL_WORKER service binding must implement fetch",
      )
      .optional(),
    PHOTOS_ADMIN_URL: z.string().trim().min(1),
  })
  .superRefine((env, ctx) => {
    if (env.EMAIL_WORKER) {
      return;
    }

    ctx.addIssue({
      code: "custom",
      message: "Auth requires the EMAIL_WORKER service binding.",
      path: ["EMAIL_WORKER"],
    });
  });

export type EnvBindings = z.input<typeof publicEnvSchema> & Partial<z.input<typeof authEnvSchema>>;
