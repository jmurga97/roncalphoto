import { normalizePhotoMetadata } from "@roncal/shared";

import { generateId } from "@/shared/utils/id";

import type { CreatePhotoInput } from "@/modules/photos/types";
import type { ApiPhoto } from "@roncal/shared";

export function createPhotoEntity(input: CreatePhotoInput): ApiPhoto {
  return {
    id: input.id ?? generateId(),
    sessionId: input.sessionId,
    url: input.url,
    miniature: input.miniature,
    alt: input.alt,
    about: input.about,
    sortOrder: input.sortOrder ?? 0,
    metadata: normalizePhotoMetadata(input.metadata),
  };
}
