import { cors } from "hono/cors";

import { getRuntimeEnv, resolveAllowedOrigin } from "@/config/env";

import type { AppBindings } from "@/config/types";
import type { MiddlewareHandler } from "hono";

export const corsMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  if (c.req.path === "/api/auth" || c.req.path.startsWith("/api/auth/")) {
    await next();
    return;
  }

  return cors({
    origin: (origin, context) => {
      const runtimeEnv = getRuntimeEnv(context as Parameters<typeof getRuntimeEnv>[0]);

      return resolveAllowedOrigin(origin, runtimeEnv.allowedOrigins, {
        allowLocalDevelopmentOrigin: true,
        missingOriginValue: null,
        nodeEnv: runtimeEnv.NODE_ENV,
      });
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  })(c, next);
};
