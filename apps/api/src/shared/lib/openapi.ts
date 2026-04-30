import { createRouter } from "@/app/create-app";
import type { AppRouteHandler } from "@/config/types";
import { validationErrorResponses } from "@/shared/lib/http";
import { type RouteConfig, createRoute } from "@hono/zod-openapi";
type RouteResponses = RouteConfig["responses"];

interface ApiRouteOptions extends Omit<RouteConfig, "responses"> {
  responses: RouteResponses;
  errorResponses?: RouteResponses;
}

export function createApiRoute({
  responses,
  errorResponses = validationErrorResponses,
  ...route
}: ApiRouteOptions) {
  return createRoute({
    ...route,
    responses: {
      ...responses,
      ...errorResponses,
    },
  });
}

export function createOpenApiRouter<Route extends RouteConfig>(
  route: Route,
  handler: AppRouteHandler<Route>,
) {
  return createRouter().openapi(route, handler);
}
