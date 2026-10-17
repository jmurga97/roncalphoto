import { z } from "zod";

import { photoContentInput } from "../../shared/input.schema";

export const createPhotoUploadInput = z.object({
  /** Same key on retry = same upload; a key reused with a different payload is rejected. */
  idempotencyKey: z.string().trim().min(8).max(160),
  data: photoContentInput.extend({
    filename: z.string().trim().min(1).max(255),
    contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(25 * 1024 * 1024),
  }),
});

export const uploadIdInput = z.object({ uploadId: z.uuid() });

export type CreatePhotoUploadInput = z.infer<typeof createPhotoUploadInput>;
