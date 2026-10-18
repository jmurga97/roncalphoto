import { z } from "zod";

import { idInput, photoContentInput } from "../../shared/input.schema";

export const listPhotosInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  search: z.string().trim().max(200).default(""),
});
export type ListPhotosInput = z.infer<typeof listPhotosInput>;

// Photos are created by `photoUploads`; here every field is editable and optional.
export const updatePhotoInput = idInput.extend({
  data: photoContentInput.extend({ url: z.url(), miniature: z.url() }).partial(),
});

export type UpdatePhotoInput = z.infer<typeof updatePhotoInput>;
