import type { EnvBindings } from "./env/schema";
import type { RuntimeEnv } from "./env/types";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Session as AuthSession } from "@roncal/auth";
import type { Env as HonoPinoEnv } from "hono-pino";

export type AppBindings = {
  Bindings: EnvBindings;
  Variables: {
    runtimeEnv: RuntimeEnv;
    authSession: AuthSession;
  };
} & HonoPinoEnv;

export type OpenApiApp = OpenAPIHono<AppBindings>;

export type AppRouteHandler<Route extends RouteConfig> = RouteHandler<Route, AppBindings>;
