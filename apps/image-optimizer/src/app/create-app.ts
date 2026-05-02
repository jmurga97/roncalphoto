import { parseEnv } from "@/config/env";
import { notFoundHandler, onErrorHandler } from "@/config/handlers";
import { OK } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import { Hono } from "hono";
import { corsMiddleware } from "./middlewares/cors";
import { registerRoutes } from "./routes";

export function createApp() {
  const app = new Hono<AppBindings>({ strict: false });

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
      OK,
    ),
  );

  app.get("/", (c) =>
    c.json(
      {
        success: true as const,
        data: {
          name: "RoncalPhoto Image Optimizer",
          version: "0.0.1",
          endpoints: {
            health: "/health",
            uploads: "/api/images/uploads",
          },
        },
      },
      OK,
    ),
  );

  registerRoutes(app);

  app.notFound(notFoundHandler);
  app.onError(onErrorHandler);

  return app;
}
