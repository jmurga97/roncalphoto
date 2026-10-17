import type { RuntimeEnv } from "../config/env";

function allowedOrigin(request: Request, env: RuntimeEnv): string | null {
  const origin = request.headers.get("Origin");

  if (!origin) {
    return null;
  }

  // Outside production any origin is reflected (Vite ports, Playwright, LAN devices).
  return env.NODE_ENV !== "production" || env.ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

function applyCors(headers: Headers, request: Request, env: RuntimeEnv): Headers {
  const origin = allowedOrigin(request, env);

  headers.append("Vary", "Origin");

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  return headers;
}

export function preflight(request: Request, env: RuntimeEnv): Response {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") ?? "Content-Type",
    "Access-Control-Max-Age": "86400",
  });

  return new Response(null, { status: 204, headers: applyCors(headers, request, env) });
}

export function withCors(response: Response, request: Request, env: RuntimeEnv): Response {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: applyCors(new Headers(response.headers), request, env),
  });
}
