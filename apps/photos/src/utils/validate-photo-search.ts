export interface PhotoSearch {
  photo?: string;
  tag?: string;
}

export function validatePhotoSearch(search: Record<string, unknown>): PhotoSearch {
  return {
    photo: typeof search.photo === "string" && search.photo.length > 0 ? search.photo : undefined,
    tag: typeof search.tag === "string" && search.tag.length > 0 ? search.tag : undefined,
  };
}
