import { parseEnv } from "@/config/env";
import { defaultValidationHook, notFoundHandler, onErrorHandler } from "@/config/handlers";
import { createPinoLogger } from "@/config/pino-logger";
import type { AppBindings } from "@/config/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "./middlewares/auth";
import { corsMiddleware } from "./middlewares/cors";
import { registerRoutes } from "./routes";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: defaultValidationHook,
  });
}

export function createApp() {
  const app = createRouter();

  app.use("*", createPinoLogger());
  app.use("*", async (c, next) => {
    c.set("runtimeEnv", parseEnv(c.env));
    await next();
  });
  app.use("*", corsMiddleware);

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

  app.use("/api/*", authMiddleware);
  registerRoutes(app);

  app.notFound(notFoundHandler);
  app.onError(onErrorHandler);

  return app;
}
