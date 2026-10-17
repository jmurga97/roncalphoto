import { CanvasPhotoNode } from "./canvas-photo-node";
import { useCanvasPointerControls } from "../hooks/use-canvas-pointer-controls";

import type { CanvasCameraControls } from "../hooks/use-canvas-camera";
import type { CanvasPhotoItem, CanvasPlacement } from "../types";
import type { RefObject } from "react";

interface CanvasStageProps {
  camera: CanvasCameraControls;
  items: CanvasPhotoItem[];
  onClearSelection: () => void;
  onOpenPhoto: (photoId: string) => void;
  onRevealPhoto: (photoId: string) => void;
  placementsById: Map<string, CanvasPlacement>;
  selectedPhotoId?: string;
  stageRef: RefObject<HTMLDivElement | null>;
  worldRef: RefObject<HTMLDivElement | null>;
}

export function CanvasStage({
  camera,
  items,
  onClearSelection,
  onOpenPhoto,
  onRevealPhoto,
  placementsById,
  selectedPhotoId,
  stageRef,
  worldRef,
}: CanvasStageProps) {
  const handleCanvasClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;

    if (!selectedPhotoId || target?.closest("[data-canvas-photo]")) {
      return;
    }

    onClearSelection();
  };

  useCanvasPointerControls({ camera, onCanvasClick: handleCanvasClick, stageRef });

  return (
    <div className="canvas-stage" data-selected={selectedPhotoId ? "true" : undefined} ref={stageRef}>
      <div className="canvas-world" ref={worldRef}>
        {items.map((item) => {
          const placement = placementsById.get(item.id);

          if (!placement) {
            return null;
          }

          return (
            <CanvasPhotoNode
              isActive={item.id === selectedPhotoId}
              item={item}
              key={item.id}
              onFocusReveal={onRevealPhoto}
              onOpen={onOpenPhoto}
              placement={placement}
            />
          );
        })}
      </div>
    </div>
  );
}
