import { queryOptions } from "@tanstack/react-query";

import { adminQueryKeys } from "../query-keys";
import { photosService } from "./photos";

export function photosListQueryOptions() {
  return queryOptions({
    queryKey: adminQueryKeys.photos.list(),
    queryFn: () => photosService.listPhotos(),
    staleTime: 60 * 1000,
  });
}

export function photoDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: adminQueryKeys.photos.detail(id),
    queryFn: () => photosService.getPhotoById(id),
    staleTime: 60 * 1000,
  });
}
