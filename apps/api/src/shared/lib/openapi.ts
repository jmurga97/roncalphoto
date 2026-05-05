import { validationErrorResponses } from "@/shared/lib/http";
import { type RouteConfig, createRoute } from "@hono/zod-openapi";
type RouteResponses = RouteConfig["responses"];

type ApiRouteOptions<Route extends RouteConfig> = Omit<Route, "responses"> & {
  responses: Route["responses"];
  errorResponses?: RouteResponses;
};

type ApiRouteWithErrors<Route extends RouteConfig> = Omit<Route, "responses"> & {
  responses: Route["responses"] & RouteResponses;
};

export function createApiRoute<const Route extends RouteConfig>({
  responses,
  errorResponses = validationErrorResponses,
  ...route
}: ApiRouteOptions<Route>) {
  return createRoute({
    ...route,
    responses: {
      ...responses,
      ...errorResponses,
    },
  } as ApiRouteWithErrors<Route>);
}
