import { getRuntimeEnv } from "@/config/env";
import type { AppBindings } from "@/config/types";
import type { Context, Next } from "hono";
import { cors } from "hono/cors";

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalDevelopmentOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.replace(/^\[(.*)\]$/, "$1");

    return (url.protocol === "http:" || url.protocol === "https:") && LOCAL_DEV_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export async function corsMiddleware(c: Context<AppBindings>, next: Next) {
  const runtimeEnv = getRuntimeEnv(c);

  const middleware = cors({
    origin: (origin) => {
      if (!origin) {
        return "*";
      }

      if (runtimeEnv.allowedOrigins.includes(origin)) {
        return origin;
      }

      if (runtimeEnv.NODE_ENV !== "production" && isLocalDevelopmentOrigin(origin)) {
        return origin;
      }

      return null;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
  });

  return middleware(c, next);
}
