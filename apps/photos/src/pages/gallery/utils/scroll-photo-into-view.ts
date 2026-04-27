import { findGalleryRoot } from "./find-gallery-root";
import { findGalleryElement } from "./find-gallery-element";

function scrollThumbnailIntoView(thumbnail: HTMLElement | null, behavior: ScrollBehavior) {
  if (!thumbnail) {
    return;
  }

  thumbnail.scrollIntoView({
    behavior,
    block: "nearest",
    inline: "center",
  });
}

export function scrollPhotoIntoView(
  container: HTMLDivElement | null,
  photoId: string,
  behavior: ScrollBehavior,
) {
  const root = findGalleryRoot(container);
  const slide = findGalleryElement(root, "data-gallery-photo-id", photoId);

  if (!slide) return;

  slide.scrollIntoView({
    behavior,
    block: "start",
  });

  scrollThumbnailIntoView(findGalleryElement(root, "data-gallery-thumbnail-id", photoId), "auto");
}
