export function findGalleryElement(root: ParentNode | null, attribute: string, photoId: string) {
  if (!root) {
    return null;
  }

  return root.querySelector<HTMLElement>(`[${attribute}="${photoId}"]`);
}
