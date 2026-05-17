import { z } from "@hono/zod-openapi";

import { apiSessionSchema, deleteResultSchema } from "@/shared/lib/contracts";
import { createSuccessResponseSchema } from "@/shared/lib/http";

const optionalNonEmptyStringSchema = z.string().trim().min(1);
const sessionTagIdsSchema = z
  .array(z.string().trim().min(1, { error: "tagIds must contain non-empty strings" }))
  .min(1, { error: "tagIds must contain at least one tag" });

export const sessionSlugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .openapi({
      param: {
        name: "slug",
        in: "path",
      },
      example: "editorial-atardecer",
    }),
});

export const listSessionsQuerySchema = z.object({
  include: z.string().optional().openapi({ example: "photos" }),
});

export const createSessionBodySchema = z.object({
  id: optionalNonEmptyStringSchema.optional(),
  slug: optionalNonEmptyStringSchema.optional(),
  title: z.string().trim().min(1, { error: "title is required" }),
  description: z.string().trim().min(1, { error: "description is required" }),
  tagIds: sessionTagIdsSchema,
});

export const updateSessionBodySchema = z.object({
  slug: optionalNonEmptyStringSchema.optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  tagIds: sessionTagIdsSchema.optional(),
});

export const sessionsResponseSchema = createSuccessResponseSchema(
  z.array(apiSessionSchema),
).openapi("SessionsResponse");

export const sessionResponseSchema =
  createSuccessResponseSchema(apiSessionSchema).openapi("SessionResponse");

export const deleteSessionResponseSchema =
  createSuccessResponseSchema(deleteResultSchema).openapi("DeleteSessionResponse");
