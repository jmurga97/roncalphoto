import type { Context } from "hono";
import { z } from "zod";
import type {
  AppBindings,
  D1DatabaseBinding,
  ImagesBinding,
  QueueBinding,
  R2BucketBinding,
} from "./types";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:4321",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:4321",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
] as const;

const nodeEnvSchema = z.enum(["development", "test", "production"]);

const envSchema = z.object({
  IMAGES: z.custom<ImagesBinding>(
    (value) => typeof value === "object" && value !== null,
    "IMAGES binding is required",
  ),
  DB_RONCALPHOTO: z.custom<D1DatabaseBinding>(
    (value) => typeof value === "object" && value !== null,
    "DB_RONCALPHOTO binding is required",
  ),
  ORIGINALS_BUCKET: z.custom<R2BucketBinding>(
    (value) => typeof value === "object" && value !== null,
    "ORIGINALS_BUCKET binding is required",
  ),
  MEDIA_BUCKET: z.custom<R2BucketBinding>(
    (value) => typeof value === "object" && value !== null,
    "MEDIA_BUCKET binding is required",
  ),
  IMAGE_PROCESSING_QUEUE: z.custom<QueueBinding>(
    (value) => typeof value === "object" && value !== null,
    "IMAGE_PROCESSING_QUEUE binding is required",
  ),
  ADMIN_UPLOAD_TOKEN: z.string().trim().min(1),
  PUBLIC_MEDIA_BASE_URL: z.string().trim().url(),
  R2_ACCESS_KEY_ID: z.string().trim().min(1),
  R2_SECRET_ACCESS_KEY: z.string().trim().min(1),
  R2_ACCOUNT_ID: z.string().trim().min(1),
  R2_ORIGINALS_BUCKET_NAME: z.string().trim().min(1),
  ALLOWED_ORIGINS: z.string().trim().optional(),
  NODE_ENV: nodeEnvSchema.default("development"),
});

export type EnvBindings = z.input<typeof envSchema>;
type ParsedEnv = z.output<typeof envSchema>;

export interface RuntimeEnv extends ParsedEnv {
  allowedOrigins: string[];
}

function parseAllowedOrigins(value?: string): string[] {
  const configuredOrigins = value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]));
}

export function parseEnv(rawEnv: EnvBindings): RuntimeEnv {
  const env = envSchema.parse(rawEnv);

  return {
    ...env,
    allowedOrigins: parseAllowedOrigins(env.ALLOWED_ORIGINS),
  };
}

export function getRuntimeEnv(c: Context<AppBindings>): RuntimeEnv {
  return c.get("runtimeEnv");
}
