import { useState, ViewTransition } from "react";

import { PHOTO_FOCUS_TRANSITION_NAME, PHOTO_TRANSITION_CLASSES } from "@utils/view-transitions";

import { GalleryCard } from "./gallery-card";

import type { GalleryPhotoViewModel } from "../types";

interface GallerySlideProps {
  isActive: boolean;
  isTransitionTarget?: boolean;
  layout?: string;
  photo: GalleryPhotoViewModel;
  shouldLoad: boolean;
}

export function GallerySlide({ isActive, isTransitionTarget = false, layout, photo, shouldLoad }: GallerySlideProps) {
  const [hasLoaded, setHasLoaded] = useState(shouldLoad);

  // Keep visited slides mounted so scrolling never removes or downgrades the outgoing photo.
  if (shouldLoad && !hasLoaded) setHasLoaded(true);

  return (
    <GalleryCard photoId={photo.id}>
      {hasLoaded ? (
        <ViewTransition
          default="none"
          key={isTransitionTarget ? "focus" : "slide"}
          name={isTransitionTarget ? PHOTO_FOCUS_TRANSITION_NAME : undefined}
          share={isTransitionTarget ? PHOTO_TRANSITION_CLASSES : "none"}
          update={isTransitionTarget ? { "stage-resize": "photo-focus photo-resize", default: "none" } : "none"}
        >
          <img
            alt={photo.alt}
            className="max-h-full max-w-full object-contain"
            // React only names a nested boundary for a mutation inside it, not for a move caused by a distant parent.
            data-layout={layout}
            decoding="async"
            fetchPriority={isActive ? "high" : "auto"}
            loading="eager"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
            onLoad={(event) => {
              event.currentTarget.hidden = false;
            }}
            src={photo.imageSrc}
          />
        </ViewTransition>
      ) : null}
    </GalleryCard>
  );
}
