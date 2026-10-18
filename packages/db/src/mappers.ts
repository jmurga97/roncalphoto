import type { clientDeliveries, deliveryPhotos, photos, sessions, tags } from "./schema";

// Row -> API shape. D1 nulls are normalised here so every consumer gets non-nullable domain types.

export type Tag = typeof tags.$inferSelect;
type PhotoRow = typeof photos.$inferSelect;
type SessionRow = typeof sessions.$inferSelect & {
  photos: PhotoRow[];
  sessionTags: { tag: Tag }[];
};
type SessionSummaryRow = typeof sessions.$inferSelect & { sessionTags: { tag: Tag }[] };
type DeliveryRow = typeof clientDeliveries.$inferSelect & {
  photos: (typeof deliveryPhotos.$inferSelect)[];
};

export function toPhoto({ iso, aperture, shutterSpeed, lens, camera, ...photo }: PhotoRow) {
  return {
    ...photo,
    metadata: {
      iso: iso ?? 0,
      aperture: aperture ?? "",
      shutterSpeed: shutterSpeed ?? "",
      lens: lens ?? "",
      camera: camera ?? "",
    },
  };
}

export function toSession({ photos, sessionTags, ...session }: SessionRow) {
  return {
    ...session,
    createdAt: toIsoUtc(session.createdAt),
    tags: sessionTags.map(({ tag }) => tag).toSorted((a, b) => a.name.localeCompare(b.name)),
    photos: photos.map((photo) => toPhoto(photo)),
  };
}

export function toSessionSummary(
  { sessionTags, ...session }: SessionSummaryRow,
  photoCount: number,
  firstPhotoId?: string,
) {
  return {
    ...session,
    createdAt: toIsoUtc(session.createdAt),
    firstPhotoId,
    photoCount,
    tags: sessionTags.map(({ tag }) => tag).toSorted((a, b) => a.name.localeCompare(b.name)),
  };
}

function toIsoUtc(value: string) {
  const iso = value.replace(" ", "T");

  return /(?:Z|[+-]\d{2}:\d{2})$/u.test(iso) ? iso : `${iso}Z`;
}

export function toDelivery({ id, token, title, photosDeletedAt, photos }: DeliveryRow) {
  const photosAvailable = photosDeletedAt === null;

  return {
    id,
    token,
    title,
    photosAvailable,
    photos: photosAvailable
      ? photos.map(({ id, url, title, takenAt, sizeBytes, sortOrder }) => ({
          id,
          url,
          title,
          takenAt: takenAt ?? "",
          sizeBytes,
          sortOrder,
        }))
      : [],
  };
}

export type Photo = ReturnType<typeof toPhoto>;
export type Session = ReturnType<typeof toSession>;
export type SessionSummary = ReturnType<typeof toSessionSummary>;
export type Delivery = ReturnType<typeof toDelivery>;
