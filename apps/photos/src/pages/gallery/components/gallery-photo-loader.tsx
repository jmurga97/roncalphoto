interface GalleryPhotoLoaderProps {
  size?: "md" | "lg";
}

export function GalleryPhotoLoader({ size = "lg" }: GalleryPhotoLoaderProps) {
  const dimensions = size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const wrapperClassName =
    size === "lg"
      ? "gallery-loader absolute inset-0 z-10 flex items-center justify-center"
      : "gallery-loader flex h-full w-full items-center justify-center";

  return (
    <div className={wrapperClassName}>
      <div className={`gallery-loader-dot ${dimensions} animate-spin rounded-full border-2`} />
    </div>
  );
}
