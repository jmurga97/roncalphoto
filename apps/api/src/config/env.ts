import { z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { AppBindings } from "./types";

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

const logLevelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);
const nodeEnvSchema = z.enum(["development", "test", "production"]);

export interface EmailWorkerServiceBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

const publicEnvSchema = z.object({
  DB_RONCALPHOTO: z.custom<D1Database>(
    (value) => typeof value === "object" && value !== null,
    "DB_RONCALPHOTO binding is required",
  ),
  ALLOWED_ORIGINS: z.string().trim().optional(),
  LOG_LEVEL: logLevelSchema.default("info"),
  NODE_ENV: nodeEnvSchema.default("development"),
});

const authEnvSchema = z
  .object({
    BETTER_AUTH_SECRET: z.string().trim().min(1),
    EMAIL_WORKER: z
      .custom<EmailWorkerServiceBinding>(
        (value) =>
          typeof value === "object" &&
          value !== null &&
          typeof (value as { fetch?: unknown }).fetch === "function",
        "EMAIL_WORKER service binding must implement fetch",
      )
      .optional(),
    EMAIL_WORKER_URL: z.string().trim().min(1).optional(),
    EMAIL_WORKER_API_KEY: z.string().trim().min(1).optional(),
    PHOTOS_ADMIN_URL: z.string().trim().min(1),
  })
  .superRefine((env, ctx) => {
    if (env.EMAIL_WORKER || (env.EMAIL_WORKER_URL && env.EMAIL_WORKER_API_KEY)) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Auth requires the EMAIL_WORKER service binding or EMAIL_WORKER_URL and EMAIL_WORKER_API_KEY.",
      path: ["EMAIL_WORKER"],
    });
  });

export type EnvBindings = z.input<typeof publicEnvSchema> & Partial<z.input<typeof authEnvSchema>>;
type ParsedPublicEnv = z.output<typeof publicEnvSchema>;
type ParsedAuthEnv = z.output<typeof authEnvSchema>;

export interface RuntimeEnv extends ParsedPublicEnv {
  allowedOrigins: string[];
}

export type AuthRuntimeEnv = ParsedAuthEnv;

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function parseAllowedOrigins(value?: string): string[] {
  const configuredOrigins = value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]));
}

export function isLocalDevelopmentOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.replace(/^\[(.*)\]$/, "$1");

    return (url.protocol === "http:" || url.protocol === "https:") && LOCAL_DEV_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export function resolveAllowedOrigin(
  origin: string | undefined,
  allowedOrigins: readonly string[],
  options?: {
    allowLocalDevelopmentOrigin?: boolean;
    missingOriginValue?: "*" | null;
    nodeEnv?: string;
  },
): string | "*" | null {
  if (!origin) {
    return options?.missingOriginValue ?? "*";
  }

  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  if (options?.allowLocalDevelopmentOrigin && options.nodeEnv !== "production") {
    return isLocalDevelopmentOrigin(origin) ? origin : null;
  }

  return null;
}

export function resolveAuthAllowedOrigins(
  runtimeEnv: Pick<RuntimeEnv, "allowedOrigins" | "NODE_ENV">,
  photosAdminUrl?: string | null,
): string[] {
  const allowedOrigins = new Set<string>();
  const canonicalOrigin = photosAdminUrl?.trim();

  if (canonicalOrigin) {
    allowedOrigins.add(canonicalOrigin);
  }

  if (runtimeEnv.NODE_ENV !== "production") {
    for (const origin of runtimeEnv.allowedOrigins) {
      if (isLocalDevelopmentOrigin(origin)) {
        allowedOrigins.add(origin);
      }
    }
  }

  return Array.from(allowedOrigins);
}

export function parseEnv(rawEnv: EnvBindings): RuntimeEnv {
  const env = publicEnvSchema.parse(rawEnv);

  return {
    ...env,
    allowedOrigins: parseAllowedOrigins(env.ALLOWED_ORIGINS),
  };
}

export function parseAuthEnv(rawEnv: EnvBindings): AuthRuntimeEnv {
  return authEnvSchema.parse(rawEnv);
}

export function getRuntimeEnv(c: Context<AppBindings>): RuntimeEnv {
  return c.get("runtimeEnv");
}

export function getAuthRuntimeEnv(c: Context<AppBindings>): AuthRuntimeEnv {
  return parseAuthEnv(c.env);
}

export function isProductionEnv(
  env: Pick<RuntimeEnv, "NODE_ENV"> | { NODE_ENV?: string },
): boolean {
  return env.NODE_ENV === "production";
}

export { logLevelSchema, nodeEnvSchema };
