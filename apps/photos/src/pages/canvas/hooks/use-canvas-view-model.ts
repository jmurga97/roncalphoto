import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { useHighlightedSessionSlug } from "@app/store";
import { trpc } from "@lib/api/client";
import { initialCanvasSeed } from "@lib/api/initial-data";

import { buildCanvasWall, randomSeed } from "../utils/canvas-wall";

import type { CanvasPhotoItem, CanvasPlacement } from "../types";
import type { Session } from "@roncal/api/router";

const appRouteApi = getRouteApi("/_app");

export interface CanvasViewModel {
  isDimmed: (item: CanvasPhotoItem) => boolean;
  items: CanvasPhotoItem[];
  itemsById: Map<string, CanvasPhotoItem>;
  placements: CanvasPlacement[];
  placementsById: Map<string, CanvasPlacement>;
  selectedPhotoId?: string;
  sessions: Session[];
  setPhotoId: (photoId?: string, options?: SetPhotoOptions) => void;
}

interface SetPhotoOptions {
  replace?: boolean;
}

// On `/session/$slug` the stage shows that session: the requested photo if it belongs to it, else its first.
function routePhotoId(sessions: Session[], slug?: string, photoId?: string) {
  if (!slug) {
    return photoId;
  }

  const photos = sessions.find((session) => session.slug === slug)?.photos ?? [];

  return (photos.find(({ id }) => id === photoId) ?? photos[0])?.id;
}

export function useCanvasViewModel(): CanvasViewModel {
  const { photo, tag } = appRouteApi.useSearch();
  const { slug } = useParams({ strict: false });
  const navigate = appRouteApi.useNavigate();
  const { data: sessions } = useSuspenseQuery(trpc.sessions.canvas.queryOptions());
  const highlightedSessionSlug = useHighlightedSessionSlug();
  // The edge worker's seed when it sent one: it already preloaded the photo that seed puts in the centre.
  const [seed] = useState(() => initialCanvasSeed() ?? randomSeed());

  const { items, placements } = useMemo(() => buildCanvasWall(sessions, seed), [seed, sessions]);
  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const placementsById = useMemo(
    () => new Map(placements.map((placement) => [placement.photoId, placement])),
    [placements],
  );

  const requestedPhotoId = routePhotoId(sessions, slug, photo);
  const selectedPhotoId = requestedPhotoId && itemsById.has(requestedPhotoId) ? requestedPhotoId : undefined;

  // A hovered session (sidebar preview) wins over the tag.
  const isDimmed = (item: CanvasPhotoItem) => {
    if (highlightedSessionSlug) {
      return item.sessionSlug !== highlightedSessionSlug;
    }

    return Boolean(tag && !item.sessionTagSlugs.includes(tag));
  };

  // Stable (until a refetch), so the memoised wall tiles don't re-render with every CanvasView render.
  const setPhotoId = useCallback(
    (photoId?: string, { replace = false }: SetPhotoOptions = {}) => {
      const session = photoId ? sessions.find(({ photos }) => photos.some(({ id }) => id === photoId)) : undefined;

      if (!session) {
        void navigate({ replace, search: (previousSearch) => ({ ...previousSearch, photo: undefined }), to: "/" });
        return;
      }

      // The first photo is the session's own URL: keep it clean for sharing and indexing.
      const sessionPhoto = session.photos[0].id === photoId ? undefined : photoId;
      void navigate({
        params: { slug: session.slug },
        replace,
        search: (previousSearch) => ({ ...previousSearch, photo: sessionPhoto }),
        to: "/session/$slug",
      });
    },
    [navigate, sessions],
  );

  return {
    isDimmed,
    items,
    itemsById,
    placements,
    placementsById,
    selectedPhotoId,
    sessions,
    setPhotoId,
  };
}
