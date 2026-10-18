import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";

import { trpc } from "@lib/api/client";

import type { DeliveryPhotoViewModel } from "../types";

const deliveryRouteApi = getRouteApi("/delivery/$token");

interface DeliveryViewModel {
  token: string;
  title: string;
  photosAvailable: boolean;
  photos: DeliveryPhotoViewModel[];
}

export function useDeliveryViewModel(): DeliveryViewModel {
  const { token } = deliveryRouteApi.useParams();
  const { data: delivery } = useSuspenseQuery(trpc.clientDeliveries.get.queryOptions({ token }));

  const photos = useMemo<DeliveryPhotoViewModel[]>(
    () =>
      delivery.photos.map((photo) => ({
        id: photo.id,
        title: photo.title,
        imageSrc: photo.url,
        // shortcut: delivery records lack a thumbnail URL; store the worker variant when delivery creation is added.
        thumbnailSrc: photo.url,
        sizeBytes: photo.sizeBytes,
      })),
    [delivery.photos],
  );

  return {
    token,
    title: delivery.title,
    photosAvailable: delivery.photosAvailable,
    photos,
  };
}
