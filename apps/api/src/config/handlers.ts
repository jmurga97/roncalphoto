import { toHttpError } from "@/shared/errors";
import type { OpenAPIHonoOptions } from "@hono/zod-openapi";
import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { isProductionEnv } from "./env";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from "./status-codes";
import type { AppBindings } from "./types";

function formatValidationMessage(error: {
  issues: {
    path: PropertyKey[];
    message: string;
  }[];
}): string {
  const details = error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(", ");

  return details ? `Invalid request: ${details}` : "Invalid request";
}

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
