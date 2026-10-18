import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { CanvasOverviewIcon } from "@components/canvas-overview-icon";
import { MOBILE_MEDIA_QUERY } from "@utils/media-queries";
import { prefersReducedMotion } from "@utils/prefers-reduced-motion";
import { useMediaQuery } from "@utils/use-media-query";

import { CanvasPhotoStage } from "./components/canvas-photo-stage";
import { CanvasStage } from "./components/canvas-stage";
import {
  DRIFT_ANIMATION_MS,
  DRIFT_OFFSET_PX,
  OVERVIEW_ANIMATION_MS,
  OVERVIEW_TILE_PX_DESKTOP,
  OVERVIEW_TILE_PX_MOBILE,
  REVEAL_ANIMATION_MS,
} from "./constants";
import { useCanvasCamera } from "./hooks/use-canvas-camera";
import { useCanvasHint } from "./hooks/use-canvas-hint";
import { useCanvasKeyboard } from "./hooks/use-canvas-keyboard";
import { useCanvasPhotoPresentation } from "./hooks/use-canvas-photo-presentation";
import { useCanvasViewModel } from "./hooks/use-canvas-view-model";
import { cameraCenteredOn, constrainCamera, isPlacementVisible, overviewCamera, panBy } from "./utils/camera-math";
import { computeContentBounds } from "./utils/compute-canvas-layout";

import type { Camera, Size } from "./types";

export function CanvasView() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const hasDriftedRef = useRef(false);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- React 19 requires an initial ref value.
  const previousSelectedIdRef = useRef<string | undefined>(undefined);
  const {
    isDimmed,
    items,
    itemsById,
    placements,
    placementsById,
    selectedPhotoId: requestedPhotoId,
    sessions,
    setPhotoId,
  } = useCanvasViewModel();
  const initialPhotoIdRef = useRef(requestedPhotoId);
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const hint = useCanvasHint();
  const bounds = useMemo(() => computeContentBounds(placements), [placements]);

  const getViewportSize = useCallback((): Size => {
    const stage = stageRef.current;

    return stage
      ? { width: stage.clientWidth, height: stage.clientHeight }
      : { width: window.innerWidth, height: window.innerHeight };
  }, []);

  // Width of the floating sidebar card when it covers the canvas (desktop, open).
  const getSidebarInset = useCallback(() => {
    const card = document.querySelector<HTMLElement>("#photos-sidebar");

    return !isMobile && card?.dataset.sidebarOpen === "true" ? card.getBoundingClientRect().right : 0;
  }, [isMobile]);

  const constrain = useCallback(
    (camera: Camera) => constrainCamera(camera, bounds, getViewportSize(), getSidebarInset()),
    [bounds, getSidebarInset, getViewportSize],
  );
  const camera = useCanvasCamera(worldRef, constrain);

  const getOverviewCamera = useCallback(
    () => overviewCamera(bounds, getViewportSize(), isMobile ? OVERVIEW_TILE_PX_MOBILE : OVERVIEW_TILE_PX_DESKTOP),
    [bounds, getViewportSize, isMobile],
  );

  // Places the overview (again if the wall or breakpoint changes). The first
  // time it drifts in briefly to hint that the wall can move.
  useLayoutEffect(() => {
    if (items.length === 0) {
      return;
    }

    const target = getOverviewCamera();
    const shouldDrift = !hasDriftedRef.current && !initialPhotoIdRef.current && !prefersReducedMotion();
    hasDriftedRef.current = true;

    if (!shouldDrift) {
      camera.setCamera(target);
      return;
    }

    camera.setCamera(panBy(target, DRIFT_OFFSET_PX, DRIFT_OFFSET_PX * 0.6));
    camera.animateTo(target, DRIFT_ANIMATION_MS);
  }, [camera, getOverviewCamera, items.length]);

  const prepareClose = (photoId: string) => {
    const placement = placementsById.get(photoId);
    const viewport = getViewportSize();
    const current = camera.cameraRef.current;

    // The stage covers the camera jump, so the destination is visible before the closing snapshot.
    if (placement && !isPlacementVisible(placement, current, viewport, getSidebarInset())) {
      camera.jumpTo(cameraCenteredOn(placement, viewport, current.scale));
    }

    const tileImage = document.querySelector<HTMLImageElement>(`[data-canvas-photo="${CSS.escape(photoId)}"] img`);
    return Boolean(placement && tileImage?.complete && tileImage.naturalWidth > 0);
  };
  const { selectedPhotoId, transitionPhotoId } = useCanvasPhotoPresentation(requestedPhotoId, itemsById, prepareClose);
  const closePhoto = () => setPhotoId(undefined);

  // Returns keyboard focus to the originating tile when the stage closes.
  useEffect(() => {
    const previous = previousSelectedIdRef.current;
    previousSelectedIdRef.current = selectedPhotoId;
    if (selectedPhotoId || !previous) return;

    document
      .querySelector<HTMLElement>(`[data-canvas-photo="${CSS.escape(previous)}"]`)
      ?.focus({ preventScroll: true });
  }, [selectedPhotoId]);

  const revealPhoto = useCallback(
    (photoId: string) => {
      const placement = placementsById.get(photoId);
      const current = camera.cameraRef.current;
      const viewport = getViewportSize();

      if (placement && !isPlacementVisible(placement, current, viewport, getSidebarInset())) {
        camera.animateTo(cameraCenteredOn(placement, viewport, current.scale), REVEAL_ANIMATION_MS);
      }
    },
    [camera, getSidebarInset, getViewportSize, placementsById],
  );

  const showOverview = () => {
    hint.dismiss();
    camera.animateTo(getOverviewCamera(), OVERVIEW_ANIMATION_MS);
  };

  useCanvasKeyboard({
    hasSelection: Boolean(selectedPhotoId),
    onClose: closePhoto,
    onPan: (deltaX, deltaY) => {
      hint.dismiss();
      camera.stopAnimation();
      camera.setCamera(panBy(camera.cameraRef.current, deltaX, deltaY));
    },
  });

  if (items.length === 0) {
    return (
      <div className="canvas-root flex items-center justify-center text-[var(--color-text-muted)]">
        No hay fotos para mostrar
      </div>
    );
  }

  const selectedItem = selectedPhotoId ? itemsById.get(selectedPhotoId) : undefined;
  const sessionsWithPhotos = sessions.filter((session) => session.photos.length > 0);
  const selectedSessionIndex = selectedItem
    ? sessionsWithPhotos.findIndex((session) => session.slug === selectedItem.sessionSlug)
    : -1;
  const selectedSession = sessionsWithPhotos[selectedSessionIndex];
  const nextSession =
    sessionsWithPhotos.length > 1
      ? sessionsWithPhotos[(selectedSessionIndex + 1) % sessionsWithPhotos.length]
      : undefined;

  return (
    <div className="canvas-root">
      <CanvasStage
        camera={camera}
        isDimmed={isDimmed}
        items={items}
        onInteract={hint.dismiss}
        onOpenPhoto={setPhotoId}
        onRevealPhoto={revealPhoto}
        placementsById={placementsById}
        selectedPhotoId={selectedPhotoId}
        stageRef={stageRef}
        transitionPhotoId={transitionPhotoId}
        worldRef={worldRef}
      />

      {hint.isVisible ? (
        <p aria-hidden="true" className="canvas-hint glass">
          {isCoarsePointer
            ? "Arrastra para explorar · Pellizca para zoom · Toca una foto"
            : "Arrastra para explorar · Ctrl + rueda para zoom · Clic en una foto"}
        </p>
      ) : null}

      <button className="canvas-overview-button glass" onClick={showOverview} type="button">
        <CanvasOverviewIcon />
        <span>Vista general</span>
      </button>

      {selectedPhotoId && selectedSession ? (
        <CanvasPhotoStage
          nextSession={nextSession}
          onClose={closePhoto}
          onOpenSession={(photoId) => setPhotoId(photoId, { replace: true })}
          onSelectPhoto={(photoId) => setPhotoId(photoId, { replace: true })}
          selectedPhotoId={selectedPhotoId}
          session={selectedSession}
        />
      ) : null}
    </div>
  );
}
