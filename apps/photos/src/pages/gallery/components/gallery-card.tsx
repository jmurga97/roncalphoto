import type { ReactNode } from "react";

interface GalleryCardProps {
  children: ReactNode;
  photoId: string;
}

export function GalleryCard({ children, photoId }: GalleryCardProps) {
  return (
    <section
      data-gallery-photo-id={photoId}
      className="relative flex h-full w-full snap-start snap-always items-center justify-center p-4"
    >
      {children}
    </section>
  );
}
