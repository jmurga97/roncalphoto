import { getRuntimeEnv } from "@/config/env";
import { apiKeyHeaderName } from "@/config/required-headers";
import { FORBIDDEN, UNAUTHORIZED } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import type { Next } from "hono";

export async function authMiddleware(c: import("hono").Context<AppBindings>, next: Next) {
  const apiKey = c.req.header(apiKeyHeaderName);

  if (!apiKey) {
    return c.json(
      {
        success: false,
        error: `Missing API Key. Provide ${apiKeyHeaderName} header.`,
      },
      UNAUTHORIZED,
    );
  }

  if (apiKey !== getRuntimeEnv(c).API_KEY) {
    return c.json(
      {
        success: false,
        error: "Invalid API Key.",
      },
      FORBIDDEN,
    );
  }

  await next();
  return undefined;
}
