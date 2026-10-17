import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { MOBILE_MEDIA_QUERY } from "@utils/media-queries";
import { useMediaQuery } from "@utils/use-media-query";

import { CanvasDetailPanel } from "./components/canvas-detail-panel";
import { CanvasStage } from "./components/canvas-stage";
import {
  DETAIL_PANEL_MOBILE_HEIGHT_RATIO,
  DETAIL_PANEL_WIDTH_PX,
  FOCUS_ANIMATION_MS,
  RETURN_ANIMATION_MS,
  REVEAL_ANIMATION_MS,
} from "./constants";
import { useCanvasCamera } from "./hooks/use-canvas-camera";
import { useCanvasKeyboard } from "./hooks/use-canvas-keyboard";
import { useCanvasViewModel } from "./hooks/use-canvas-view-model";
import { cameraCenteredOn, cameraForPhoto, fitBoundsCover, isPlacementVisible, panBy } from "./utils/camera-math";
import { computeContentBounds } from "./utils/compute-canvas-layout";

import type { Camera, Size } from "./types";

export function CanvasView() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const previousCameraRef = useRef<Camera | null>(null);
  const isFirstCameraEffectRef = useRef(true);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- React 19 requires an initial ref value.
  const previousSelectedIdRef = useRef<string | undefined>(undefined);

  const { items, itemsById, placements, placementsById, selectedPhotoId, setPhotoId } = useCanvasViewModel();
  const camera = useCanvasCamera(worldRef);
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const getViewportSize = useCallback((): Size => {
    const stage = stageRef.current;

    return stage
      ? { width: stage.clientWidth, height: stage.clientHeight }
      : { width: window.innerWidth, height: window.innerHeight };
  }, []);

  // Follows the selection: zoom into the selected photo (leaving room for the
  // detail panel) and zoom back to the previous camera when it clears.
  useLayoutEffect(() => {
    const isFirst = isFirstCameraEffectRef.current;
    isFirstCameraEffectRef.current = false;
    const viewport = getViewportSize();

    if (selectedPhotoId) {
      const placement = placementsById.get(selectedPhotoId);

      if (!placement) {
        return;
      }

      if (!isFirst) {
        previousCameraRef.current = { ...camera.cameraRef.current };
      }

      const reserved = isMobile
        ? { right: 0, bottom: viewport.height * DETAIL_PANEL_MOBILE_HEIGHT_RATIO }
        : { right: Math.min(DETAIL_PANEL_WIDTH_PX, viewport.width / 2), bottom: 0 };

      camera.animateTo(cameraForPhoto(placement, viewport, reserved), isFirst ? 0 : FOCUS_ANIMATION_MS);
      return;
    }

    const fallback = fitBoundsCover(computeContentBounds(placements), viewport);
    const target = isFirst ? fallback : (previousCameraRef.current ?? fallback);

    camera.animateTo(target, isFirst ? 0 : RETURN_ANIMATION_MS);
  }, [camera, getViewportSize, isMobile, placements, placementsById, selectedPhotoId]);

  // Returns keyboard focus to the originating tile when the panel closes.
  useEffect(() => {
    const previous = previousSelectedIdRef.current;
    previousSelectedIdRef.current = selectedPhotoId;

    if (selectedPhotoId || !previous) {
      return;
    }

    const tile = document.querySelector<HTMLElement>(`[data-canvas-photo="${CSS.escape(previous)}"]`);
    tile?.focus({ preventScroll: true });
  }, [selectedPhotoId]);

  const closeSelection = () => setPhotoId(undefined);

  const revealPhoto = (photoId: string) => {
    const placement = placementsById.get(photoId);

    if (!placement) {
      return;
    }

    const current = camera.cameraRef.current;
    const viewport = getViewportSize();

    if (isPlacementVisible(placement, current, viewport)) {
      return;
    }

    camera.animateTo(cameraCenteredOn(placement, viewport, current.scale), REVEAL_ANIMATION_MS);
  };

  useCanvasKeyboard({
    hasSelection: Boolean(selectedPhotoId),
    onClose: closeSelection,
    onPan: (deltaX, deltaY) => {
      camera.stopAnimation();
      camera.setCamera(panBy(camera.cameraRef.current, deltaX, deltaY));
    },
  });

  const selectedItem = selectedPhotoId ? itemsById.get(selectedPhotoId) : undefined;

  if (items.length === 0) {
    return (
      <div className="canvas-root">
        <Link className="canvas-back-link" to="/">
          ← Volver
        </Link>
        <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
          No hay fotos para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-root">
      <CanvasStage
        camera={camera}
        items={items}
        onClearSelection={closeSelection}
        onOpenPhoto={setPhotoId}
        onRevealPhoto={revealPhoto}
        placementsById={placementsById}
        selectedPhotoId={selectedPhotoId}
        stageRef={stageRef}
        worldRef={worldRef}
      />

      <Link className="canvas-back-link" to="/">
        ← Volver
      </Link>

      <p aria-hidden="true" className="canvas-hint">
        Arrastra para explorar · Ctrl + rueda para hacer zoom
      </p>

      <CanvasDetailPanel item={selectedItem} onClose={closeSelection} />
    </div>
  );
}
