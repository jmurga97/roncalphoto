export function toEmailServiceError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Unknown email service error");
}
