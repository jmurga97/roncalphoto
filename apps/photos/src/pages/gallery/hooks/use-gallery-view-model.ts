import { sessionDetailQueryOptions } from "@lib/api/sessions/query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { resolvePhotoSelection } from "@utils/resolve-photo-selection";
import { useMemo } from "react";
import type { GalleryData } from "../types";

const sessionRouteApi = getRouteApi("/_app/session/$slug");

export function useGalleryViewModel(): GalleryData {
  const { slug } = sessionRouteApi.useParams();
  const { photo } = sessionRouteApi.useSearch();
  const { data: session } = useSuspenseQuery(sessionDetailQueryOptions(slug));

  const photos = useMemo(
    () =>
      session.photos.map((sessionPhoto) => ({
        alt: sessionPhoto.alt,
        id: sessionPhoto.id,
        imageSrc: sessionPhoto.url,
        thumbnailSrc: sessionPhoto.miniature,
      })),
    [session.photos],
  );

  const selection = useMemo(() => {
    const resolvedSelection = resolvePhotoSelection(session.photos, photo);

    return {
      currentIndex: resolvedSelection.selectedIndex,
      isSelectionValid: resolvedSelection.isValid,
      normalizedPhotoId: resolvedSelection.normalizedPhotoId,
    };
  }, [photo, session.photos]);

  return {
    photos,
    selection,
    sessionSlug: session.slug,
  };
}
