const preloadedImageSrcs = new Set<string>();

export function preloadImage(imageSrc: string | undefined) {
  if (!imageSrc || preloadedImageSrcs.has(imageSrc)) {
    return;
  }

  preloadedImageSrcs.add(imageSrc);

  const image = new Image();
  image.decoding = "async";
  image.src = imageSrc;

  if (typeof image.decode === "function") {
    void image.decode().catch(() => {});
  }
}

// Resolves true once the image is decoded (so <img src> lays out at its real size at once),
// false when that takes longer than `timeoutMs`.
export function waitForImage(imageSrc: string | undefined, timeoutMs: number): Promise<boolean> {
  if (!imageSrc) {
    return Promise.resolve(false);
  }

  const image = new Image();
  image.decoding = "async";
  image.src = imageSrc;

  const decoded = image.decode().then(
    () => true,
    () => false,
  );
  const timedOut = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), timeoutMs);
  });

  return Promise.race([decoded, timedOut]);
}
