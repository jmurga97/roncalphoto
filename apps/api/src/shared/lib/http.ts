import {
  BAD_REQUEST,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  type CREATED,
  OK,
  UNAUTHORIZED,
} from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import { z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { ZodTypeAny } from "zod";
import { paginationSchema } from "./contracts";

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.string(),
    stack: z.string().optional(),
  })
  .openapi("ErrorResponse");

export function createSuccessResponseSchema<DataSchema extends ZodTypeAny>(dataSchema: DataSchema) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
}

export function createPaginatedResponseSchema<ItemSchema extends ZodTypeAny>(
  itemSchema: ItemSchema,
) {
  return z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: paginationSchema,
  });
}

export function createErrorResponse(description: string) {
  return {
    description,
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  } as const;
}

export const badRequestResponse = createErrorResponse("Invalid request");
export const unauthorizedResponse = createErrorResponse("Missing API Key");
export const forbiddenResponse = createErrorResponse("Invalid API Key");
export const notFoundResponse = createErrorResponse("Resource not found");
export const internalServerErrorResponse = createErrorResponse("Internal server error");

export const protectedRouteAuthErrorResponses = {
  [UNAUTHORIZED]: unauthorizedResponse,
  [FORBIDDEN]: forbiddenResponse,
  [INTERNAL_SERVER_ERROR]: internalServerErrorResponse,
} as const;

export const protectedRouteErrorResponses = {
  [BAD_REQUEST]: badRequestResponse,
  ...protectedRouteAuthErrorResponses,
} as const;

export const protectedRouteNotFoundErrorResponses = {
  ...protectedRouteErrorResponses,
  [NOT_FOUND]: notFoundResponse,
} as const;

export function jsonSuccess<Data, Status extends typeof OK | typeof CREATED>(
  c: Context<AppBindings>,
  data: Data,
  status: Status,
) {
  return c.json(
    {
      success: true as const,
      data,
    },
    status,
  );
}

export function jsonPaginated<Data>(
  c: Context<AppBindings>,
  data: Data[],
  pagination: z.infer<typeof paginationSchema>,
) {
  return c.json(
    {
      success: true as const,
      data,
      pagination,
    },
    OK,
  );
}

export function jsonValidationError(c: Context<AppBindings>, error: string) {
  return c.json(
    {
      success: false as const,
      error,
    },
    BAD_REQUEST,
  );
}
