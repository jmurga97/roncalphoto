import { acceptedImageMimeTypes } from "@/modules/images/types";
import { z } from "zod";

const nonEmptyStringSchema = z.string().trim().min(1);

export const photoMetadataInputSchema = z
  .object({
    iso: z.number().int().positive().optional(),
    aperture: z.string().trim().optional(),
    shutterSpeed: z.string().trim().optional(),
    lens: z.string().trim().optional(),
    camera: z.string().trim().optional(),
  })
  .strip();

export const createUploadBodySchema = z
  .object({
    sessionId: nonEmptyStringSchema,
    files: z
      .array(
        z
          .object({
            filename: nonEmptyStringSchema,
            contentType: z.enum(acceptedImageMimeTypes),
            sizeBytes: z.number().int().positive(),
            alt: nonEmptyStringSchema,
            about: nonEmptyStringSchema,
            sortOrder: z.number().int().optional(),
            metadata: photoMetadataInputSchema.optional(),
          })
          .strip(),
      )
      .min(1)
      .max(100),
  })
  .strip();

export const completeUploadsBodySchema = z
  .object({
    uploadIds: z.array(nonEmptyStringSchema).min(1).max(100),
  })
  .strip();

export const listUploadsQuerySchema = z
  .object({
    sessionId: z.string().trim().min(1).optional(),
  })
  .strip();

export const uploadIdParamsSchema = z
  .object({
    uploadId: nonEmptyStringSchema,
  })
  .strip();
