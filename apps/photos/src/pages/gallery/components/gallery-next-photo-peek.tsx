interface GalleryNextPhotoPeekProps {
  currentPosition: number;
  totalPhotos: number;
}

export function GalleryNextPhotoPeek({ currentPosition, totalPhotos }: GalleryNextPhotoPeekProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-4 bottom-8"
    >
      <span className="inline-flex h-[1.9rem] min-w-[3.25rem] items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--color-border)_78%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface)_82%,transparent)] px-3 text-[0.74rem] font-bold tracking-[0.06em] text-[var(--color-text)] shadow-[var(--shadow-soft)] backdrop-blur-[14px]">
        {currentPosition} / {totalPhotos}
      </span>
    </div>
  );
}
