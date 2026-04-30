import { z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { AppBindings } from "./types";

const DEFAULT_ALLOWED_ORIGINS = [
  "*",
  "http://localhost:4321",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:4321",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
] as const;

const logLevelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);
const nodeEnvSchema = z.enum(["development", "test", "production"]);

const envSchema = z.object({
  DB_RONCALPHOTO: z.custom<D1Database>(
    (value) => typeof value === "object" && value !== null,
    "DB_RONCALPHOTO binding is required",
  ),
  ALLOWED_ORIGINS: z.string().trim().optional(),
  LOG_LEVEL: logLevelSchema.default("info"),
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

export function isProductionEnv(
  env: Pick<RuntimeEnv, "NODE_ENV"> | { NODE_ENV?: string },
): boolean {
  return env.NODE_ENV === "production";
}

export { logLevelSchema, nodeEnvSchema };
