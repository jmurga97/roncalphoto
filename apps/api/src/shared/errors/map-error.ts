import { formatValidationMessage } from "@/shared/lib/validation";
import { ZodError } from "zod";
import { HttpError, isHttpError } from "./http-error";

export function toHttpError(error: unknown, fallbackMessage = "Internal server error"): HttpError {
  if (isHttpError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return new HttpError(400, formatValidationMessage(error));
  }

  if (error instanceof Error && error.message.includes("FOREIGN KEY constraint failed")) {
    return new HttpError(400, "Session not found");
  }

  return new HttpError(500, fallbackMessage);
}
