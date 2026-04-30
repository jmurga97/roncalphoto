import { createRouter } from "@/app/create-app";
import { apiKeyHeaderSchema } from "@/config/required-headers";
import type { AppRouteHandler } from "@/config/types";
import {
  protectedRouteAuthErrorResponses,
  protectedRouteErrorResponses,
} from "@/shared/lib/http";
import { createRoute, type RouteConfig } from "@hono/zod-openapi";

type RouteRequest = NonNullable<RouteConfig["request"]>;
type RouteResponses = RouteConfig["responses"];

interface ProtectedRouteOptions extends Omit<RouteConfig, "request" | "responses"> {
  request?: Omit<RouteRequest, "headers">;
  responses: RouteResponses;
  errorResponses?: RouteResponses;
}

export function createProtectedRoute({
  request,
  responses,
  errorResponses = protectedRouteErrorResponses,
  ...route
}: ProtectedRouteOptions) {
  return createRoute({
    ...route,
    request: request ? { headers: apiKeyHeaderSchema, ...request } : { headers: apiKeyHeaderSchema },
    responses: {
      ...responses,
      ...errorResponses,
    },
  });
}

export function createReadOnlyProtectedRoute(options: ProtectedRouteOptions) {
  return createProtectedRoute({
    ...options,
    errorResponses: protectedRouteAuthErrorResponses,
  });
}

export function createOpenApiRouter<Route extends RouteConfig>(
  route: Route,
  handler: AppRouteHandler<Route>,
) {
  return createRouter().openapi(route, handler);
}
