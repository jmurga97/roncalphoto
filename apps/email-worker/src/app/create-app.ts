import { notFoundHandler, onErrorHandler } from "@/config/handlers";
import type { AppBindings } from "@/config/types";
import { Hono } from "hono";
import { registerRoutes } from "./routes";

export function createRouter() {
  return new Hono<AppBindings>({ strict: false });
}

export function createApp() {
  const app = createRouter();

  registerRoutes(app);

  app.notFound(notFoundHandler);
  app.onError(onErrorHandler);

  return app;
}
