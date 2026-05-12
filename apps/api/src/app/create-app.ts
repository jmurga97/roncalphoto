import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { authHandler } from "@/auth";
import {
  getRuntimeEnv,
  parseEnv,
  resolveAllowedOrigin,
  resolveAuthAllowedOrigins,
} from "@/config/env";
import { defaultValidationHook, notFoundHandler, onErrorHandler } from "@/config/handlers";
import { createPinoLogger } from "@/config/pino-logger";

import { corsMiddleware } from "./middlewares/cors";
import { registerRoutes } from "./routes";

import type { AppBindings } from "@/config/types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: defaultValidationHook,
  });
}

export function createApp() {
  const app = createRouter();
  const authCorsMiddleware = cors({
    origin: (origin, c) => {
      const runtimeEnv = getRuntimeEnv(c as Parameters<typeof getRuntimeEnv>[0]);
      const authBindings = c.env as { PHOTOS_ADMIN_URL?: string | null };
      const authAllowedOrigins = resolveAuthAllowedOrigins(
        runtimeEnv,
        authBindings.PHOTOS_ADMIN_URL,
      );

      return resolveAllowedOrigin(origin, authAllowedOrigins, {
        missingOriginValue: null,
      });
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  });

  app.use("*", createPinoLogger());
  app.use("*", async (c, next) => {
    c.set("runtimeEnv", parseEnv(c.env));
    await next();
  });
  app.use("/api/auth/*", authCorsMiddleware);
  app.use("*", corsMiddleware);
  app.on(["GET", "POST"], "/api/auth/*", authHandler);

  app.get("/health", (c) =>
    c.json(
      {
        success: true as const,
        data: {
          status: "ok",
          timestamp: new Date().toISOString(),
        },
      },
      200,
    ),
  );

  app.get("/", (c) =>
    c.json(
      {
        success: true as const,
        data: {
          name: "RoncalPhoto API",
          version: "2.0.0",
          endpoints: {
            sessions: "/api/sessions",
            tags: "/api/tags",
            photos: "/api/photos",
            doc: "/doc",
          },
        },
      },
      200,
    ),
  );

  registerRoutes(app);

  app.notFound(notFoundHandler);
  app.onError(onErrorHandler);

  return app;
}
