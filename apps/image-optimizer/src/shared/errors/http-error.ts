export type HttpErrorStatus = 400 | 401 | 404 | 409 | 413 | 415 | 500;

export class HttpError extends Error {
  constructor(
    public readonly status: HttpErrorStatus,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
