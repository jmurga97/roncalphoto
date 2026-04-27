export class HttpError extends Error {
  readonly status: 400 | 401 | 403 | 404 | 500;

  constructor(status: 400 | 401 | 403 | 404 | 500, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
