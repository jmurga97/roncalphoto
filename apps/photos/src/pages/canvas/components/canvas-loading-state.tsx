import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useMemo, useRef } from "react";

import { useSidebarOpen } from "@app/store";
import { CanvasOverviewIcon } from "@components/canvas-overview-icon";
import { trpc } from "@lib/api/client";
import { MOBILE_MEDIA_QUERY } from "@utils/media-queries";
import { useMediaQuery } from "@utils/use-media-query";

import { OVERVIEW_TILE_PX_DESKTOP, OVERVIEW_TILE_PX_MOBILE } from "../constants";
import { constrainCamera, overviewCamera } from "../utils/camera-math";
import { computeCanvasLayout, computeContentBounds } from "../utils/compute-canvas-layout";

const FALLBACK_PHOTO_COUNT = 32;

interface CanvasLoadingStateProps {
  label?: string;
}

export function CanvasLoadingState({ label = "Cargando contenido..." }: CanvasLoadingStateProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const isSidebarOpen = useSidebarOpen();
  const { data: sessions } = useQuery(trpc.sessions.list.queryOptions());
  const photoCount = sessions?.reduce((count, session) => count + session.photoCount, 0) ?? FALLBACK_PHOTO_COUNT;
  const placements = useMemo(
    () => computeCanvasLayout(Array.from({ length: photoCount }, (_, index) => `loading-${index}`)),
    [photoCount],
  );
  const bounds = useMemo(() => computeContentBounds(placements), [placements]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const world = worldRef.current;

    if (!stage || !world) return;

    const updateCamera = () => {
      const viewport = { height: stage.clientHeight, width: stage.clientWidth };
      if (!viewport.width || !viewport.height) return;

      const sidebar = document.querySelector<HTMLElement>("#photos-sidebar");
      const insetLeft =
        !isMobile && isSidebarOpen && sidebar?.dataset.sidebarOpen === "true"
          ? sidebar.getBoundingClientRect().right
          : 0;
      const camera = constrainCamera(
        overviewCamera(bounds, viewport, isMobile ? OVERVIEW_TILE_PX_MOBILE : OVERVIEW_TILE_PX_DESKTOP),
        bounds,
        viewport,
        insetLeft,
      );

      world.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
    };

    const observer = new ResizeObserver(updateCamera);
    observer.observe(stage);
    updateCamera();

    return () => observer.disconnect();
  }, [bounds, isMobile, isSidebarOpen]);

  return (
    <div aria-busy="true" className="canvas-root">
      <p className="sr-only" role="status">
        {label}
      </p>
      <div aria-hidden="true" className="canvas-stage pointer-events-none" ref={stageRef}>
        <div className="canvas-world" ref={worldRef}>
          {placements.map((placement) => (
            <div
              className="canvas-loading-tile animate-pulse motion-reduce:animate-none"
              key={placement.photoId}
              style={{
                height: placement.height,
                left: placement.x,
                top: placement.y,
                width: placement.width,
              }}
            />
          ))}
        </div>
      </div>
      <button aria-hidden="true" className="canvas-overview-button glass" disabled type="button">
        <CanvasOverviewIcon />
        <span>Vista general</span>
      </button>
    </div>
  );
}
