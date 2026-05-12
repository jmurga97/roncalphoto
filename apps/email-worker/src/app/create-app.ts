import { Hono } from "hono";

import { notFoundHandler, onErrorHandler } from "@/config/handlers";

import { registerRoutes } from "./routes";

import type { AppBindings } from "@/config/types";

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
