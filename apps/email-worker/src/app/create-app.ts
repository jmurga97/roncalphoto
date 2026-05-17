import { OpenAPIHono } from "@hono/zod-openapi";

import { defaultValidationHook, notFoundHandler, onErrorHandler } from "@/config/handlers";

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

  registerRoutes(app);

  app.notFound(notFoundHandler);
  app.onError(onErrorHandler);

  return app;
}
