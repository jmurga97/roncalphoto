import { normalizePhotoMetadata } from "@roncal/shared";

import { toApiPhoto } from "@/shared/lib/api-mappers";

import type { UpdatePhotoInput } from "@/modules/photos/types";
import type { PhotoRecord } from "@/shared/lib/api-mappers";
import type { ApiPhoto } from "@roncal/shared";

export function mergePhotoEntity(existing: PhotoRecord, input: UpdatePhotoInput): ApiPhoto {
  const currentPhoto = toApiPhoto(existing);

  return {
    ...currentPhoto,
    sessionId: input.sessionId ?? currentPhoto.sessionId,
    url: input.url ?? currentPhoto.url,
    miniature: input.miniature ?? currentPhoto.miniature,
    alt: input.alt ?? currentPhoto.alt,
    about: input.about ?? currentPhoto.about,
    sortOrder: input.sortOrder ?? currentPhoto.sortOrder,
    metadata: normalizePhotoMetadata({
      ...currentPhoto.metadata,
      ...input.metadata,
    }),
  };
}
