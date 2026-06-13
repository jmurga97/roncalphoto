export class HttpError extends Error {
  readonly status: 400 | 401 | 403 | 404 | 409 | 413 | 415 | 500 | 502 | 503;

  constructor(status: 400 | 401 | 403 | 404 | 409 | 413 | 415 | 500 | 502 | 503, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
