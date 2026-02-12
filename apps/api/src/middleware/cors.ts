import { cors } from "hono/cors";
import type { Env } from "../types";

/**
 * Default allowed origins for development and production
 */
const DEFAULT_ORIGINS = [
  "*", // Allow all origins by default
  "http://localhost:4321", // Astro dev server
  "http://localhost:3000", // Alternative dev port
  "http://127.0.0.1:4321",
  "http://127.0.0.1:3000",
];

/**
 * Creates CORS middleware with configured origins
 * Additional origins can be set via ALLOWED_ORIGINS env variable (comma-separated)
 */
export function createCorsMiddleware(env?: Env) {
  const additionalOrigins = env?.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [];

  const allowedOrigins = [...DEFAULT_ORIGINS, ...additionalOrigins];

  return cors({
    origin: (origin) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return "*";
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) return origin;
      // Deny other origins
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-API-Key"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400, // 24 hours
    credentials: true,
  });
}
