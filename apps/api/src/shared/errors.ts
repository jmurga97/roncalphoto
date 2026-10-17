import { TRPCError } from "@trpc/server";

// The schema enforces integrity (FKs, unique slugs/tokens); surface those violations as client errors.
const CONSTRAINT_ERRORS = [
  {
    text: "FOREIGN KEY constraint failed",
    code: "BAD_REQUEST",
    message: "A referenced record does not exist",
  },
  { text: "UNIQUE constraint failed", code: "CONFLICT", message: "The record already exists" },
] as const;

export function toRpcError(error: unknown): TRPCError {
  if (error instanceof TRPCError) {
    return error;
  }

  if (error instanceof Error) {
    const constraint = CONSTRAINT_ERRORS.find(({ text }) => error.message.includes(text));

    if (constraint) {
      return new TRPCError({ code: constraint.code, message: constraint.message, cause: error });
    }

    // Drizzle wraps driver errors; the D1 message lives in the cause chain.
    if (error.cause) {
      return toRpcError(error.cause);
    }
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    cause: error,
  });
}

export function orNotFound<T>(value: T | null, entity: string): T {
  if (value === null) {
    throw new TRPCError({ code: "NOT_FOUND", message: `${entity} not found` });
  }

  return value;
}
