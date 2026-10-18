import { z } from "zod";

import { slugInput } from "../../shared/input.schema";

const sessionFields = z.object({
  title: z.string().trim().min(1).max(120),
  /** Omit to derive it from the title. Collisions get a numeric suffix. */
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).max(5000),
  tagIds: z
    .array(z.string().trim().min(1))
    .min(1)
    .transform((ids) => [...new Set(ids)]),
});

export const createSessionInput = sessionFields;
export const updateSessionInput = slugInput.extend({ data: sessionFields.partial() });

export type CreateSessionInput = z.infer<typeof createSessionInput>;
export type UpdateSessionInput = z.infer<typeof updateSessionInput>;
