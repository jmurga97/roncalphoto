import { createDb } from "@roncal/db/client";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createApiAuth } from "./auth";
import { parseEnv } from "./config/env";
import { preflight, withCors } from "./http/cors";
import { createContext } from "./trpc/context";
import { appRouter } from "./trpc/router";

import type { EnvBindings, RuntimeEnv } from "./config/env";

async function handleRequest(request: Request, env: RuntimeEnv): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname === "/health") {
    return Response.json({ status: "ok" });
  }

  if (pathname.startsWith("/api/auth/")) {
    return createApiAuth(createDb(env.DB_RONCALPHOTO), env).handler(request);
  }

  if (pathname.startsWith("/trpc/")) {
    const response = await fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext: () => createContext(env, request),
      onError: ({ error, path }) => {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          console.error("tRPC procedure failed", { path, error: error.cause ?? error });
        }
      },
    });

    // Responses can depend on the session cookie: never cache them in shared caches.
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

export default {
  async fetch(request: Request, bindings: EnvBindings): Promise<Response> {
    const env = parseEnv(bindings);

    if (request.method === "OPTIONS") {
      return preflight(request, env);
    }

    try {
      return withCors(await handleRequest(request, env), request, env);
    } catch (error) {
      console.error("Request failed", error);
      return withCors(Response.json({ error: "Internal server error" }, { status: 500 }), request, env);
    }
  },
};
