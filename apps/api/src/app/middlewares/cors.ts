import { getRuntimeEnv } from "@/config/env";
import type { AppBindings } from "@/config/types";
import type { Next } from "hono";
import { cors } from "hono/cors";

export async function corsMiddleware(c: import("hono").Context<AppBindings>, next: Next) {
  const allowedOrigins = getRuntimeEnv(c).allowedOrigins;

  const middleware = cors({
    origin: (origin) => {
      if (!origin) {
        return "*";
      }

      if (allowedOrigins.includes(origin)) {
        return origin;
      }

      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  });

  return middleware(c, next);
}
