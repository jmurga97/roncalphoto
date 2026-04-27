export type DomainErrorCode =
  | "TAG_IDS_REQUIRED"
  | "TAG_NOT_FOUND"
  | "SESSION_SLUG_REQUIRED"
  | "SESSION_CREATE_FAILED";

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode) {
    super(code);
    this.name = "DomainError";
    this.code = code;
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
