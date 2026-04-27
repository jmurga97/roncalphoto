import type { ReactNode } from "react";

interface GalleryCardProps {
  children: ReactNode;
  slideRef: (element: HTMLElement | null) => void;
}

export function GalleryCard({ children, slideRef }: GalleryCardProps) {
  return (
    <section
      ref={slideRef}
      className="relative flex h-full w-full snap-start snap-always items-center justify-center p-4"
    >
      {children}
    </section>
  );
}
