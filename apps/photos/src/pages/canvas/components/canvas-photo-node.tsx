import { memo, ViewTransition } from "react";

import { preloadImage } from "@utils/preload-image";
import { PHOTO_FOCUS_TRANSITION_NAME, PHOTO_TRANSITION_CLASSES } from "@utils/view-transitions";

import type { CanvasPhotoItem, CanvasPlacement } from "../types";
import type { FocusEvent } from "react";

interface CanvasPhotoNodeProps {
  isBackground: boolean;
  isDimmed: boolean;
  isTransitionSource: boolean;
  item: CanvasPhotoItem;
  onFocusReveal: (photoId: string) => void;
  onOpen: (photoId: string) => void;
  placement: CanvasPlacement;
  shouldLoad: boolean;
}

export const CanvasPhotoNode = memo(function CanvasPhotoNode({
  isBackground,
  isDimmed,
  isTransitionSource,
  item,
  onFocusReveal,
  onOpen,
  placement,
  shouldLoad,
}: CanvasPhotoNodeProps) {
  const preloadFull = () => preloadImage(item.fullSrc);

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(":focus-visible")) {
      onFocusReveal(item.id);
    }
  };

  return (
    <button
      aria-label={item.alt}
      className="canvas-photo"
      data-canvas-photo={item.id}
      data-dimmed={isDimmed ? "true" : undefined}
      onClick={() => onOpen(item.id)}
      onFocus={handleFocus}
      onPointerDown={preloadFull}
      onPointerEnter={preloadFull}
      style={{
        height: placement.height,
        left: placement.x,
        top: placement.y,
        width: placement.width,
      }}
      type="button"
    >
      <ViewTransition
        default="none"
        key={isTransitionSource ? "source" : "wall"}
        name={isTransitionSource ? PHOTO_FOCUS_TRANSITION_NAME : undefined}
        share={isTransitionSource ? PHOTO_TRANSITION_CLASSES : "none"}
      >
        <span
          className="canvas-photo-frame bg-[var(--color-surface-2)]"
          style={{
            transform: placement.rotation ? `rotate(${placement.rotation}deg)` : undefined,
          }}
        >
          {shouldLoad ? (
            <img
              alt=""
              className="canvas-photo-image"
              // The tile remounts when it becomes (or stops being) the morph source; async decoding paints it
              // blank for a frame, a visible flash on Safari. Miniatures are cheap to decode.
              decoding="sync"
              draggable={false}
              fetchPriority={isBackground ? "low" : "auto"}
              height={placement.height}
              loading="eager"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
              src={item.miniatureSrc}
              width={placement.width}
            />
          ) : null}
        </span>
      </ViewTransition>
    </button>
  );
});
