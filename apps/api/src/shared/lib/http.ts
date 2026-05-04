import {
  BAD_REQUEST,
  type CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
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
export const unauthorizedResponse = createErrorResponse("Unauthorized");
export const notFoundResponse = createErrorResponse("Resource not found");
export const internalServerErrorResponse = createErrorResponse("Internal server error");

export const defaultErrorResponses = {
  [INTERNAL_SERVER_ERROR]: internalServerErrorResponse,
} as const;

export const validationErrorResponses = {
  [BAD_REQUEST]: badRequestResponse,
  ...defaultErrorResponses,
} as const;

export const validationNotFoundErrorResponses = {
  ...validationErrorResponses,
  [NOT_FOUND]: notFoundResponse,
} as const;

export const protectedValidationErrorResponses = {
  ...validationErrorResponses,
  [UNAUTHORIZED]: unauthorizedResponse,
} as const;

export const protectedValidationNotFoundErrorResponses = {
  ...validationNotFoundErrorResponses,
  [UNAUTHORIZED]: unauthorizedResponse,
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
