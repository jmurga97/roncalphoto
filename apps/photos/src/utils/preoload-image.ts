export function preloadImage(src: string): Promise<string> {
  if (!src) {
    return Promise.reject(new Error("Image source is required"));
  }

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(src);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;

    if (image.complete && image.naturalWidth > 0) {
      resolve(src);
      return;
    }

    if (typeof image.decode === "function") {
      image.decode().then(
        () => resolve(src),
        () => {
          // decode can fail for cross-origin images even when load succeeds
        },
      );
    }
  });
}
