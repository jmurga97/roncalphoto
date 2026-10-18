import { useRouterState } from "@tanstack/react-router";
import { addTransitionType, startTransition, useEffect, useEffectEvent, useState } from "react";

import { waitForImage } from "@utils/preload-image";

import { OPEN_DECODE_TIMEOUT_MS } from "../constants";

import type { CanvasPhotoItem } from "../types";

interface PhotoPresentation {
  photoId?: string;
  morphPhotoId?: string;
}

interface PreparedTransition extends PhotoPresentation {
  type: "stage-open" | "stage-close" | "stage-swap";
}

// Router stores publish synchronously; the displayed selection must be React state to animate.
export function useCanvasPhotoPresentation(
  requestedPhotoId: string | undefined,
  itemsById: Map<string, CanvasPhotoItem>,
  prepareClose: (photoId: string) => boolean,
) {
  const [presentation, setPresentation] = useState<PhotoPresentation>({ photoId: requestedPhotoId });
  const [prepared, setPrepared] = useState<PreparedTransition | null>(null);
  const beforeClose = useEffectEvent(prepareClose);
  // Wait for the router to finish publishing; its pending fallback would split the shared-element pair.
  const isNavigating = useRouterState({ select: (state) => state.status !== "idle" });

  useEffect(() => {
    if (isNavigating || requestedPhotoId === presentation.photoId) return;

    let cancelled = false;
    const previous = presentation.photoId;
    const currentSession = previous ? itemsById.get(previous)?.sessionSlug : undefined;
    const nextSession = requestedPhotoId ? itemsById.get(requestedPhotoId)?.sessionSlug : undefined;

    if (previous && requestedPhotoId && currentSession === nextSession) {
      // Gallery scrolling already supplies its own motion; updating the URL must not crossfade it.
      // oxlint-disable-next-line react/set-state-in-effect -- Synchronizes the external router store without animating scroll updates.
      setPresentation({ photoId: requestedPhotoId });
    } else if (requestedPhotoId) {
      void waitForImage(itemsById.get(requestedPhotoId)?.fullSrc, OPEN_DECODE_TIMEOUT_MS).then((ready) => {
        if (cancelled) return;

        setPrepared({
          photoId: requestedPhotoId,
          morphPhotoId: ready && !previous ? requestedPhotoId : undefined,
          type: previous ? "stage-swap" : "stage-open",
        });
      });
    } else {
      // oxlint-disable-next-line react/set-state-in-effect -- Prepares the destination after external navigation, before React captures it.
      setPrepared({ type: "stage-close", morphPhotoId: previous && beforeClose(previous) ? previous : undefined });
    }

    return () => {
      cancelled = true;
    };
  }, [isNavigating, itemsById, presentation.photoId, requestedPhotoId]);

  useEffect(() => {
    if (isNavigating || !prepared || prepared.photoId !== requestedPhotoId) return;

    // Commit the named source first, then let React capture and transfer it to the stage.
    startTransition(() => {
      addTransitionType(prepared.type);
      setPresentation({ photoId: prepared.photoId, morphPhotoId: prepared.morphPhotoId });
      setPrepared(null);
    });
  }, [isNavigating, prepared, requestedPhotoId]);

  return {
    selectedPhotoId: presentation.photoId,
    // A prepared fade (no morph) must also clear the last closed tile's name, or that tile morphs into the new photo.
    transitionPhotoId: prepared ? prepared.morphPhotoId : presentation.morphPhotoId,
  };
}
