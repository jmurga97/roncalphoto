import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Env as HonoPinoEnv } from "hono-pino";
import type { EnvBindings, RuntimeEnv } from "./env";

export type AppBindings = {
  Bindings: EnvBindings;
  Variables: {
    runtimeEnv: RuntimeEnv;
  };
} & HonoPinoEnv;

export type OpenApiApp = OpenAPIHono<AppBindings>;

export type AppRouteHandler<Route extends RouteConfig> = RouteHandler<Route, AppBindings>;
