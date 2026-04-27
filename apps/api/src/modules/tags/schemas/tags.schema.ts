import { apiTagWithSessionsSchema, tagSchema } from "@/shared/lib/contracts";
import { createSuccessResponseSchema } from "@/shared/lib/http";
import { z } from "@hono/zod-openapi";

export const tagSlugParamsSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1, "slug is required")
      .openapi({
        param: {
          name: "slug",
          in: "path",
        },
        example: "urbano",
      }),
  })
  .strip();

export const tagsResponseSchema = createSuccessResponseSchema(z.array(tagSchema)).openapi(
  "TagsResponse",
);

export const tagDetailResponseSchema =
  createSuccessResponseSchema(apiTagWithSessionsSchema).openapi("TagDetailResponse");
