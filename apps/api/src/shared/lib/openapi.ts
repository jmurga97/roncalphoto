import { validationErrorResponses } from "@/shared/lib/http";
import { type RouteConfig, createRoute } from "@hono/zod-openapi";
type RouteResponses = RouteConfig["responses"];

type ApiRouteOptions = RouteConfig & {
  errorResponses?: RouteResponses;
};

type ApiRouteWithErrors<Route extends ApiRouteOptions> = Omit<
  Route,
  "errorResponses" | "responses"
> & {
  responses: Route["responses"] & RouteResponses;
};

export function createApiRoute<const Route extends ApiRouteOptions>(route: Route) {
  const { responses, errorResponses = validationErrorResponses, ...routeConfig } = route;

  return createRoute({
    ...routeConfig,
    responses: {
      ...responses,
      ...errorResponses,
    },
  } as ApiRouteWithErrors<Route>);
}
