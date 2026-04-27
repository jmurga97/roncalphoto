import { sessionDetailQueryOptions } from "@lib/api/sessions/query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { resolvePhotoSelection } from "@utils/resolve-photo-selection";
import { useEffect, useMemo } from "react";
import type { GalleryData } from "../types";

const sessionRouteApi = getRouteApi("/_app/session/$slug");

export function useGalleryViewModel(): GalleryData {
  const { slug } = sessionRouteApi.useParams();
  const { photo } = sessionRouteApi.useSearch();
  const navigate = sessionRouteApi.useNavigate();
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

  function setPhotoId(photoId?: string) {
    void navigate({
      params: { slug: session.slug },
      replace: true,
      search: (previousSearch) => {
        const normalizedPhotoId = photoId ?? undefined;

        if (previousSearch.photo === normalizedPhotoId) {
          return previousSearch;
        }

        return normalizedPhotoId ? { photo: normalizedPhotoId } : {};
      },
      to: "/session/$slug",
    });
  }

  useEffect(() => {
    if (selection.isSelectionValid || photos.length === 0 || !selection.normalizedPhotoId) {
      return;
    }

    void navigate({
      params: { slug: session.slug },
      replace: true,
      search: { photo: selection.normalizedPhotoId },
      to: "/session/$slug",
    });
  }, [
    navigate,
    photos.length,
    selection.isSelectionValid,
    selection.normalizedPhotoId,
    session.slug,
  ]);

  return {
    photos,
    selection,
    setPhotoId,
    sessionSlug: session.slug,
  };
}
