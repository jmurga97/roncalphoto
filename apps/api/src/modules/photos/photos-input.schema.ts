import { z } from "zod";

import { idInput, photoContentInput } from "../../shared/input.schema";

// Photos are created by `photoUploads`; here every field is editable and optional.
export const updatePhotoInput = idInput.extend({
  data: photoContentInput.extend({ url: z.url(), miniature: z.url() }).partial(),
});

export type UpdatePhotoInput = z.infer<typeof updatePhotoInput>;
