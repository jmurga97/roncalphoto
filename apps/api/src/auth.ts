import { createAuth } from "@roncal/auth";
import * as schema from "@roncal/db/schema";

import type { RuntimeEnv } from "./config/env";
import type { AppDb } from "@roncal/db/client";

export function createApiAuth(db: AppDb, env: RuntimeEnv) {
  return createAuth({
    db,
    schema,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: env.ALLOWED_ORIGINS,
    emailWorker: env.EMAIL_WORKER,
    // Production serves the admin and the API from different sites.
    cookieMode: env.NODE_ENV === "production" ? "cross-site" : "same-site",
    fixedOtp: env.DEV_FIXED_OTP === "true" && env.NODE_ENV !== "production" ? "000000" : undefined,
  });
}
