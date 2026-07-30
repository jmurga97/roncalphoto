import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";

import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";

import { computeCanvasLayout } from "../utils/compute-canvas-layout";

import type { CanvasPhotoItem, CanvasPlacement } from "../types";

const canvasRouteApi = getRouteApi("/canvas");

export interface CanvasViewModel {
  items: CanvasPhotoItem[];
  itemsById: Map<string, CanvasPhotoItem>;
  placements: CanvasPlacement[];
  placementsById: Map<string, CanvasPlacement>;
  selectedPhotoId?: string;
  setPhotoId: (photoId?: string) => void;
}

export function useCanvasViewModel(): CanvasViewModel {
  const { photo } = canvasRouteApi.useSearch();
  const navigate = canvasRouteApi.useNavigate();
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());

  const items = useMemo(
    () =>
      sessions.flatMap((session) =>
        session.photos.map((sessionPhoto) => ({
          about: sessionPhoto.about,
          alt: sessionPhoto.alt,
          fullSrc: sessionPhoto.url,
          id: sessionPhoto.id,
          metadata: sessionPhoto.metadata,
          miniatureSrc: sessionPhoto.miniature,
          sessionSlug: session.slug,
          sessionTitle: session.title,
        })),
      ),
    [sessions],
  );

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const placements = useMemo(() => computeCanvasLayout(items.map((item) => item.id)), [items]);

  const placementsById = useMemo(
    () => new Map(placements.map((placement) => [placement.photoId, placement])),
    [placements],
  );

  const selectedPhotoId = photo && itemsById.has(photo) ? photo : undefined;

  function setPhotoId(photoId?: string) {
    void navigate({
      search: (previousSearch) => {
        if (previousSearch.photo === photoId) {
          return previousSearch;
        }

        return photoId ? { photo: photoId } : {};
      },
      to: "/canvas",
    });
  }

  return { items, itemsById, placements, placementsById, selectedPhotoId, setPhotoId };
}
