import { z } from "zod";

import type { D1Database } from "@cloudflare/workers-types";
import type { EmailWorkerBinding } from "@roncal/auth";

/** RPC surface of ming-image-worker's `ImageRpc` entrypoint. Responses are validated at the call site. */
export interface ImageWorkerBinding {
  createUpload(input: {
    productId: string;
    idempotencyKey: string;
    upload: {
      presetId: string;
      externalId: string;
      filename: string;
      contentType: string;
      sizeBytes: number;
      metadata: { source: string };
    };
  }): Promise<unknown>;
  getUpload(input: { productId: string; uploadId: string }): Promise<unknown>;
  retryUpload(input: { productId: string; uploadId: string }): Promise<unknown>;
}

function binding<T>(name: string, method?: string) {
  return z.custom<T>(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      (!method || typeof (value as Record<string, unknown>)[method] === "function"),
    `${name} binding is missing or invalid`,
  );
}

export const envSchema = z.object({
  DB_RONCALPHOTO: binding<D1Database>("DB_RONCALPHOTO"),
  IMAGE_WORKER: binding<ImageWorkerBinding>("IMAGE_WORKER", "createUpload"),
  EMAIL_WORKER: binding<EmailWorkerBinding>("EMAIL_WORKER", "fetch"),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  /** Comma-separated browser origins allowed by CORS and trusted by Better Auth. */
  ALLOWED_ORIGINS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** `"true"` accepts OTP 000000 without sending email; ignored when NODE_ENV is production. */
  DEV_FIXED_OTP: z.string().optional(),
});

export type EnvBindings = z.input<typeof envSchema>;
export type RuntimeEnv = z.output<typeof envSchema>;

export function parseEnv(bindings: EnvBindings): RuntimeEnv {
  return envSchema.parse(bindings);
}
