import { parseAllowedOrigins } from "./origins";
import { publicEnvSchema, authEnvSchema } from "./schema";

import type { EnvBindings } from "./schema";
import type { AuthRuntimeEnv, RuntimeEnv } from "./types";
import type { AppBindings } from "@/config/types";
import type { Context } from "hono";

export function parseEnv(rawEnv: EnvBindings): RuntimeEnv {
  const env = publicEnvSchema.parse(rawEnv);

  return {
    ...env,
    allowedOrigins: parseAllowedOrigins(env.ALLOWED_ORIGINS),
  };
}

export function parseAuthEnv(rawEnv: EnvBindings): AuthRuntimeEnv {
  return authEnvSchema.parse(rawEnv) as AuthRuntimeEnv;
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
