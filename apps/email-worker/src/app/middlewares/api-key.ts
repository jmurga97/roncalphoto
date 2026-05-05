import type { AppBindings } from "@/config/types";
import { errorResponse } from "@/shared/http/responses";
import type { MiddlewareHandler } from "hono";

export const apiKeyMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const configuredApiKey = c.env.WORKER_API_KEY?.trim();

  if (!configuredApiKey) {
    return next();
  }

  const apiKey = c.req.header("X-Api-Key")?.trim();

  if (!apiKey || apiKey !== configuredApiKey) {
    return errorResponse("UNAUTHORIZED", "Invalid API key", 401);
  }

  return next();
};
