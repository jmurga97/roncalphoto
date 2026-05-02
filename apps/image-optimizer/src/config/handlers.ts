import { HttpError } from "@/shared/errors/http-error";
import type { ErrorHandler, NotFoundHandler } from "hono";
import { z } from "zod";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from "./status-codes";
import type { AppBindings } from "./types";

export const notFoundHandler: NotFoundHandler<AppBindings> = (c) =>
  c.json(
    {
      success: false as const,
      error: "Not found",
    },
    NOT_FOUND,
  );

export const onErrorHandler: ErrorHandler<AppBindings> = (error, c) => {
  const httpError =
    error instanceof HttpError
      ? error
      : error instanceof z.ZodError
        ? new HttpError(BAD_REQUEST, error.issues[0]?.message ?? "Invalid request")
        : new HttpError(INTERNAL_SERVER_ERROR, "Internal server error");

  if (httpError.status === INTERNAL_SERVER_ERROR) {
    console.error(error);
  }

  return c.json(
    {
      success: false as const,
      error: httpError.message,
    },
    httpError.status,
  );
};
