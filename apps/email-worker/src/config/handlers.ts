import { errorResponse } from "@/shared/http/responses";

import type { AppBindings } from "./types";
import type { ErrorHandler, NotFoundHandler } from "hono";

export const notFoundHandler: NotFoundHandler<AppBindings> = () =>
  errorResponse("NOT_FOUND", "Not found", 404);

export const onErrorHandler: ErrorHandler<AppBindings> = (error) =>
  errorResponse(
    "INTERNAL_SERVER_ERROR",
    error instanceof Error ? error.message : "Internal server error",
    500,
  );
