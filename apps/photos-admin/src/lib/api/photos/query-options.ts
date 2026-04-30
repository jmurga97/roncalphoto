import { queryOptions } from "@tanstack/react-query";
import { adminQueryKeys } from "../query-keys";
import { photosService } from "./photos";

export function photosListQueryOptions(page: number, pageSize: number) {
  return queryOptions({
    queryKey: adminQueryKeys.photos.list(page, pageSize),
    queryFn: () => photosService.listPhotos({ page, pageSize }),
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
