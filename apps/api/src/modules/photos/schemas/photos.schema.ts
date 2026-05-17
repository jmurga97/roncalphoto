import { z } from "@hono/zod-openapi";

import { apiPhotoSchema, deleteResultSchema } from "@/shared/lib/contracts";
import { createSuccessResponseSchema } from "@/shared/lib/http";

export const photoIdParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, { error: "id is required" })
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "photo_01",
    }),
});

export const listPhotosQuerySchema = z.object({});

export const photoMetadataInputSchema = z.object({
  iso: z.number().optional(),
  aperture: z.string().optional(),
  shutterSpeed: z.string().optional(),
  lens: z.string().optional(),
  camera: z.string().optional(),
});

export const createPhotoBodySchema = z.object({
  id: z.string().trim().min(1, { error: "id must be a non-empty string when provided" }).optional(),
  sessionId: z.string().trim().min(1, { error: "sessionId is required" }),
  url: z.string().trim().min(1, { error: "url is required" }),
  miniature: z.string().trim().min(1, { error: "miniature is required" }),
  alt: z.string().trim().min(1, { error: "alt is required" }),
  about: z.string().trim().min(1, { error: "about is required" }),
  sortOrder: z.number().optional(),
  metadata: photoMetadataInputSchema.optional(),
});

export const updatePhotoBodySchema = z.object({
  sessionId: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  miniature: z.string().trim().min(1).optional(),
  alt: z.string().trim().min(1).optional(),
  about: z.string().trim().min(1).optional(),
  sortOrder: z.number().optional(),
  metadata: photoMetadataInputSchema.optional(),
});

export const photoResponseSchema =
  createSuccessResponseSchema(apiPhotoSchema).openapi("PhotoResponse");

export const photosResponseSchema = createSuccessResponseSchema(z.array(apiPhotoSchema)).openapi(
  "PhotosResponse",
);

export const deletePhotoResponseSchema =
  createSuccessResponseSchema(deleteResultSchema).openapi("DeletePhotoResponse");
