import type { PhotoMetadata } from "@roncal/api/router";

export interface CanvasPhotoItem {
  id: string;
  alt: string;
  miniatureSrc: string;
  fullSrc: string;
  about: string;
  metadata: PhotoMetadata;
  sessionSlug: string;
  sessionTitle: string;
}

export interface CanvasPlacement {
  photoId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ReservedViewportSpace {
  right: number;
  bottom: number;
}
