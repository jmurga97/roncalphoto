import { getAuthRuntimeEnv, getRuntimeEnv, resolveAuthAllowedOrigins } from "@/config/env";
import { BAD_REQUEST, UNAUTHORIZED } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import { getAuthDb } from "@/db/auth";
import { HttpError } from "@/shared/errors";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";
import { createAuth } from "@roncal/auth";
import type { Context, Next } from "hono";

type AuthSession = {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

interface AuthHandler {
  handler(request: Request): Response | Promise<Response>;
  api: {
    getSession(context: { headers: Headers }): Promise<AuthSession | null>;
  };
}

const authInstances = new WeakMap<D1Database, AuthHandler>();

function createAuthConfigError() {
  return new HttpError(
    BAD_REQUEST,
    "Auth is not configured. Set BETTER_AUTH_SECRET, EMAIL_WORKER_URL, EMAIL_WORKER_API_KEY and PHOTOS_ADMIN_URL in apps/api/.dev.vars to use /api/auth.",
  );
}

export function getConfiguredAuthEnv(c: Context<AppBindings>) {
  try {
    return getAuthRuntimeEnv(c);
  } catch {
    throw createAuthConfigError();
  }
}

export function getAuth(c: Context<AppBindings>): AuthHandler {
  const authEnv = getConfiguredAuthEnv(c);
  const runtimeEnv = getRuntimeEnv(c);
  const trustedOrigins = resolveAuthAllowedOrigins(runtimeEnv, authEnv.PHOTOS_ADMIN_URL);

  return getOrCreateInstance(authInstances, c.env.DB_RONCALPHOTO, () =>
    createAuth({
      db: getAuthDb(c.env.DB_RONCALPHOTO),
      env: authEnv,
      trustedOrigins,
    }),
  );
}

export function authHandler(c: Context<AppBindings>): Response | Promise<Response> {
  return getAuth(c).handler(c.req.raw);
}

export async function requireSession(c: Context<AppBindings>, next: Next) {
  const session = await getAuth(c).api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HttpError(UNAUTHORIZED, "Unauthorized");
  }

  c.set("authSession", session);
  await next();
}
