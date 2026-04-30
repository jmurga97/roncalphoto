import { toHttpError } from "@/shared/errors";
import { formatValidationMessage } from "@/shared/lib/validation";
import type { OpenAPIHonoOptions } from "@hono/zod-openapi";
import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { isProductionEnv } from "./env";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from "./status-codes";
import type { AppBindings } from "./types";

function isProductionContext(c: Context<AppBindings>): boolean {
  const runtimeEnv = c.var.runtimeEnv;

  if (runtimeEnv) {
    return isProductionEnv(runtimeEnv);
  }

  return isProductionEnv(c.env);
}

export const defaultValidationHook: OpenAPIHonoOptions<AppBindings>["defaultHook"] = (
  result,
  c,
) => {
  if (result.success) {
    return undefined;
  }

  return c.json(
    {
      success: false as const,
      error: formatValidationMessage(result.error),
    },
    BAD_REQUEST,
  );
};

export const notFoundHandler: NotFoundHandler<AppBindings> = (c) =>
  c.json(
    {
      success: false as const,
      error: "Not found",
    },
    NOT_FOUND,
  );

export const onErrorHandler: ErrorHandler<AppBindings> = (error, c) => {
  const httpError = toHttpError(error);
  const isProduction = isProductionContext(c);
  const logger = c.get("logger");

  if (httpError.status === INTERNAL_SERVER_ERROR) {
    logger?.error({ err: error }, "Unhandled error");
  }

  return c.json(
    {
      success: false as const,
      error: httpError.message,
      ...(!isProduction && error instanceof Error ? { stack: error.stack } : {}),
    },
    httpError.status,
  );
};
