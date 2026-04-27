import { z } from "@hono/zod-openapi";

export const photoMetadataSchema = z
  .object({
    iso: z.number().openapi({ example: 400 }),
    aperture: z.string().openapi({ example: "f/2.8" }),
    shutterSpeed: z.string().openapi({ example: "1/250" }),
    lens: z.string().openapi({ example: "24-70mm f/2.8" }),
    camera: z.string().openapi({ example: "Canon EOS R5" }),
  })
  .openapi("PhotoMetadata");

export const tagSchema = z
  .object({
    id: z.string().openapi({ example: "tag_urban" }),
    name: z.string().openapi({ example: "Urbano" }),
    slug: z.string().openapi({ example: "urbano" }),
  })
  .openapi("Tag");

export const apiPhotoSchema = z
  .object({
    id: z.string().openapi({ example: "photo_01" }),
    sessionId: z.string().openapi({ example: "session_01" }),
    url: z.string().openapi({ example: "https://cdn.example.com/photo.jpg" }),
    miniature: z.string().openapi({ example: "https://cdn.example.com/photo-thumb.jpg" }),
    alt: z.string().openapi({ example: "Retrato en exterior" }),
    about: z.string().openapi({ example: "Fotografia editorial al atardecer." }),
    sortOrder: z.number().openapi({ example: 0 }),
    metadata: photoMetadataSchema,
  })
  .openapi("ApiPhoto");

export const apiSessionSchema = z
  .object({
    id: z.string().openapi({ example: "session_01" }),
    slug: z.string().openapi({ example: "editorial-atardecer" }),
    title: z.string().openapi({ example: "Editorial al atardecer" }),
    description: z.string().openapi({ example: "<p>Sesion editorial en exteriores.</p>" }),
    createdAt: z.string().openapi({ example: "2026-04-21 18:30:00" }),
    tags: z.array(tagSchema),
    photos: z.array(apiPhotoSchema).optional(),
  })
  .openapi("ApiSession");

export const apiTagWithSessionsSchema = z
  .object({
    tag: tagSchema,
    sessions: z.array(apiSessionSchema),
  })
  .openapi("ApiTagWithSessions");

export const deleteResultSchema = z
  .object({
    deleted: z.literal(true),
  })
  .openapi("DeleteResult");

export const paginationSchema = z
  .object({
    total: z.number().int().nonnegative().openapi({ example: 100 }),
    page: z.number().int().positive().openapi({ example: 1 }),
    pageSize: z.number().int().positive().openapi({ example: 20 }),
    hasMore: z.boolean().openapi({ example: true }),
  })
  .openapi("Pagination");
