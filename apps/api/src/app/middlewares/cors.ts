import { getRuntimeEnv, resolveAllowedOrigin } from "@/config/env";
import type { AppBindings } from "@/config/types";
import type { Next } from "hono";
import { cors } from "hono/cors";

export async function corsMiddleware(c: import("hono").Context<AppBindings>, next: Next) {
  if (c.req.path === "/api/auth" || c.req.path.startsWith("/api/auth/")) {
    await next();
    return;
  }

  const runtimeEnv = getRuntimeEnv(c);
  const allowedOrigins = runtimeEnv.allowedOrigins;

  const middleware = cors({
    origin: (origin) => {
      return resolveAllowedOrigin(origin, allowedOrigins, {
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
  });

  return middleware(c, next);
}
