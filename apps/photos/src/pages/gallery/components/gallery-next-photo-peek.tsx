interface GalleryNextPhotoPeekProps {
  currentPosition: number;
  totalPhotos: number;
}

export function GalleryNextPhotoPeek({ currentPosition, totalPhotos }: GalleryNextPhotoPeekProps) {
  return (
    <div aria-hidden="true" className="gallery-next-peek">
      <span className="gallery-next-peek-count">
        {currentPosition} / {totalPhotos}
      </span>
    </div>
  );
}
