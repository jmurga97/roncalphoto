import { memo } from "react";

import type { CanvasPhotoItem, CanvasPlacement } from "../types";
import type { FocusEvent, SyntheticEvent } from "react";

interface CanvasPhotoNodeProps {
  isActive: boolean;
  item: CanvasPhotoItem;
  onFocusReveal: (photoId: string) => void;
  onOpen: (photoId: string) => void;
  placement: CanvasPlacement;
}

function markLoaded(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.dataset.loaded = "true";
}

export const CanvasPhotoNode = memo(function CanvasPhotoNode({
  isActive,
  item,
  onFocusReveal,
  onOpen,
  placement,
}: CanvasPhotoNodeProps) {
  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(":focus-visible")) {
      onFocusReveal(item.id);
    }
  };

  return (
    <button
      aria-label={item.alt}
      className="canvas-photo"
      data-active={isActive ? "true" : undefined}
      data-canvas-photo={item.id}
      onClick={() => onOpen(item.id)}
      onFocus={handleFocus}
      style={{
        height: placement.height,
        left: placement.x,
        top: placement.y,
        width: placement.width,
      }}
      type="button"
    >
      <span
        className="canvas-photo-frame"
        style={{ transform: `rotate(${placement.rotation}deg)` }}
      >
        <img
          alt=""
          className="canvas-photo-image"
          decoding="async"
          draggable={false}
          src={item.miniatureSrc}
        />
        {isActive ? (
          <img
            alt=""
            className="canvas-photo-image canvas-photo-image-full"
            decoding="async"
            draggable={false}
            onLoad={markLoaded}
            src={item.fullSrc}
          />
        ) : null}
      </span>
    </button>
  );
});
