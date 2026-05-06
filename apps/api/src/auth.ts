import {
  getAuthRuntimeEnv,
  getRuntimeEnv,
  isProductionEnv,
  resolveAuthAllowedOrigins,
} from "@/config/env";
import { BAD_REQUEST, UNAUTHORIZED } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import { getDb, schema } from "@/db";
import { HttpError } from "@/shared/errors";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";
import {
  type Auth,
  OTP_EXPIRES_IN_LABEL,
  createAuth,
  createEmailWorkerOtpSender,
} from "@roncal/auth";
import type { Context, Next } from "hono";

const authInstances = new WeakMap<D1Database, Auth>();

function createAuthConfigError() {
  return new HttpError(
    BAD_REQUEST,
    "Auth is not configured. Set BETTER_AUTH_SECRET, BETTER_AUTH_URL, PHOTOS_ADMIN_URL, and configure the EMAIL_WORKER service binding.",
  );
}

export function getConfiguredAuthEnv(c: Context<AppBindings>) {
  try {
    return getAuthRuntimeEnv(c);
  } catch {
    throw createAuthConfigError();
  }
}

export function getAuth(c: Context<AppBindings>): Auth {
  const authEnv = getConfiguredAuthEnv(c);
  const runtimeEnv = getRuntimeEnv(c);

  return getOrCreateInstance(authInstances, c.env.DB_RONCALPHOTO, () =>
    createAuth({
      db: getDb(c.env.DB_RONCALPHOTO),
      schema,
      secret: authEnv.BETTER_AUTH_SECRET,
      baseURL: authEnv.BETTER_AUTH_URL,
      trustedOrigins: resolveAuthAllowedOrigins(runtimeEnv, authEnv.PHOTOS_ADMIN_URL),
      cookieMode: isProductionEnv(runtimeEnv) ? "cross-site" : "same-site",
      emailOtpSender: createEmailWorkerOtpSender({
        worker: authEnv.EMAIL_WORKER,
        expiresInLabel: OTP_EXPIRES_IN_LABEL,
      }),
    }),
  );
}

export function authHandler(c: Context<AppBindings>) {
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
