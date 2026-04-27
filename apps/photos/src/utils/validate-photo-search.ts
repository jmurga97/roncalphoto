import { z } from "zod";

const photoSearchSchema = z.object({
  photo: z.preprocess(
    (value) => (typeof value === "string" && value.length > 0 ? value : undefined),
    z.string().optional(),
  ),
});

export type PhotoSearch = z.infer<typeof photoSearchSchema>;

export function validatePhotoSearch(search: Record<string, unknown>): PhotoSearch {
  return photoSearchSchema.parse(search);
}
