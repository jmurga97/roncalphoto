import { z } from "@hono/zod-openapi";

import { apiPhotoSchema, deleteResultSchema } from "@/shared/lib/contracts";
import { createSuccessResponseSchema } from "@/shared/lib/http";

export const photoIdParamsSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, "id is required")
      .openapi({
        param: {
          name: "id",
          in: "path",
        },
        example: "photo_01",
      }),
  })
  .strip();

export const listPhotosQuerySchema = z.object({}).strip();

export const photoMetadataInputSchema = z
  .object({
    iso: z.number().finite().optional(),
    aperture: z.string().optional(),
    shutterSpeed: z.string().optional(),
    lens: z.string().optional(),
    camera: z.string().optional(),
  })
  .strip();

export const createPhotoBodySchema = z
  .object({
    id: z.string().trim().min(1, "id must be a non-empty string when provided").optional(),
    sessionId: z.string().trim().min(1, "sessionId is required"),
    url: z.string().trim().min(1, "url is required"),
    miniature: z.string().trim().min(1, "miniature is required"),
    alt: z.string().trim().min(1, "alt is required"),
    about: z.string().trim().min(1, "about is required"),
    sortOrder: z.number().finite().optional(),
    metadata: photoMetadataInputSchema.optional(),
  })
  .strip();

export const updatePhotoBodySchema = z
  .object({
    sessionId: z.string().trim().min(1).optional(),
    url: z.string().trim().min(1).optional(),
    miniature: z.string().trim().min(1).optional(),
    alt: z.string().trim().min(1).optional(),
    about: z.string().trim().min(1).optional(),
    sortOrder: z.number().finite().optional(),
    metadata: photoMetadataInputSchema.optional(),
  })
  .strip();

export const photoResponseSchema =
  createSuccessResponseSchema(apiPhotoSchema).openapi("PhotoResponse");

export const photosResponseSchema = createSuccessResponseSchema(z.array(apiPhotoSchema)).openapi(
  "PhotosResponse",
);

export const deletePhotoResponseSchema =
  createSuccessResponseSchema(deleteResultSchema).openapi("DeletePhotoResponse");
