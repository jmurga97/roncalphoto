import { useEffect, useState } from "react";

import { CanvasPhotoNode } from "./canvas-photo-node";
import { useCanvasPointerControls } from "../hooks/use-canvas-pointer-controls";

import type { CanvasCameraControls } from "../hooks/use-canvas-camera";
import type { CanvasPhotoItem, CanvasPlacement } from "../types";
import type { RefObject } from "react";

interface CanvasStageProps {
  camera: CanvasCameraControls;
  isDimmed: (item: CanvasPhotoItem) => boolean;
  items: CanvasPhotoItem[];
  onInteract: () => void;
  onOpenPhoto: (photoId: string) => void;
  onRevealPhoto: (photoId: string) => void;
  placementsById: Map<string, CanvasPlacement>;
  selectedPhotoId?: string;
  stageRef: RefObject<HTMLDivElement | null>;
  transitionPhotoId?: string;
  worldRef: RefObject<HTMLDivElement | null>;
}

export function CanvasStage({
  camera,
  isDimmed,
  items,
  onInteract,
  onOpenPhoto,
  onRevealPhoto,
  placementsById,
  selectedPhotoId,
  stageRef,
  transitionPhotoId,
  worldRef,
}: CanvasStageProps) {
  useCanvasPointerControls({ camera, onInteract, stageRef });
  const [loadedPhotoIds, setLoadedPhotoIds] = useState(() => new Set<string>());

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || selectedPhotoId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        setLoadedPhotoIds((previous) => {
          const next = new Set(previous);
          for (const entry of visible) {
            next.add((entry.target as HTMLElement).dataset.canvasPhoto!);
          }
          return next;
        });
        for (const entry of visible) observer.unobserve(entry.target);
      },
      { root: stage, rootMargin: "200px" },
    );

    for (const tile of stage.querySelectorAll("[data-canvas-photo]")) observer.observe(tile);
    return () => observer.disconnect();
  }, [items, selectedPhotoId, stageRef]);

  return (
    <div
      className="canvas-stage"
      data-selected={selectedPhotoId ? "true" : undefined}
      inert={Boolean(selectedPhotoId)}
      ref={stageRef}
    >
      <div className="canvas-world" ref={worldRef}>
        {items.map((item) => {
          const placement = placementsById.get(item.id);

          if (!placement) {
            return null;
          }

          return (
            <CanvasPhotoNode
              isBackground={Boolean(selectedPhotoId)}
              isDimmed={isDimmed(item)}
              isTransitionSource={!selectedPhotoId && item.id === transitionPhotoId}
              item={item}
              key={item.id}
              onFocusReveal={onRevealPhoto}
              onOpen={onOpenPhoto}
              placement={placement}
              shouldLoad={loadedPhotoIds.has(item.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
