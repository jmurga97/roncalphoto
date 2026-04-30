import { ZodError } from "zod";
import { formatValidationMessage } from "@/shared/lib/validation";
import { DomainError, type DomainErrorCode, isDomainError } from "./domain-error";
import { HttpError, isHttpError } from "./http-error";

const domainErrorMap: Record<DomainErrorCode, HttpError> = {
  TAG_IDS_REQUIRED: new HttpError(400, "tagIds is required and must contain at least one tag"),
  TAG_NOT_FOUND: new HttpError(400, "One or more tags were not found"),
  SESSION_SLUG_REQUIRED: new HttpError(400, "slug must be a non-empty string when provided"),
  SESSION_CREATE_FAILED: new HttpError(500, "Failed to create session"),
};

export function toHttpError(error: unknown, fallbackMessage = "Internal server error"): HttpError {
  if (isHttpError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return new HttpError(400, formatValidationMessage(error));
  }

  if (isDomainError(error)) {
    return domainErrorMap[error.code] ?? new HttpError(500, fallbackMessage);
  }

  if (error instanceof Error && error.message.includes("FOREIGN KEY constraint failed")) {
    return new HttpError(400, "Session not found");
  }

  return new HttpError(500, fallbackMessage);
}

export function ensureDomainError(code: DomainErrorCode): DomainError {
  return new DomainError(code);
}
