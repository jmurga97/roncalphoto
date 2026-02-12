import type { Context, Next } from "hono";
import type { Env } from "../types";

/**
 * API Key authentication middleware
 * Validates X-API-Key header against the configured API_KEY secret
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const apiKey = c.req.header("X-API-Key");

  if (!apiKey) {
    return c.json(
      {
        success: false,
        error: "Missing API Key. Provide X-API-Key header.",
      },
      401,
    );
  }

  if (apiKey !== c.env.API_KEY) {
    return c.json(
      {
        success: false,
        error: "Invalid API Key.",
      },
      403,
    );
  }

  await next();
  return undefined;
}
