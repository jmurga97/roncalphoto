export function findGalleryRoot(container: HTMLDivElement | null) {
  return (container?.closest("[data-gallery-root]") as HTMLElement | null) ?? null;
}
