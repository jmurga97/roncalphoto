import { z } from "zod";

export const idInput = z.object({ id: z.string().trim().min(1) });
export const slugInput = z.object({ slug: z.string().trim().min(1) });

// "" or null clears an optional metadata field.
const metadataText = z
  .string()
  .trim()
  .nullable()
  .transform((value) => value || null);

/** Editable photo content, shared by `photos.update` and `photoUploads.create`. */
export const photoContentInput = z.object({
  sessionId: z.string().trim().min(1),
  alt: z.string().trim().min(1).max(200),
  about: z.string().trim().min(1).max(5000),
  sortOrder: z.number().int().optional(),
  metadata: z
    .object({
      iso: z.number().int().positive().nullable(),
      aperture: metadataText,
      shutterSpeed: metadataText,
      lens: metadataText,
      camera: metadataText,
    })
    .partial()
    .optional(),
});
