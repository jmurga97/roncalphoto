import { queryOptions } from "@tanstack/react-query";
import { preloadImage } from "@utils/preoload-image";

export function imageResourceQueryOptions(src: string) {
  return queryOptions({
    queryKey: ["gallery", "image-resource", src],
    queryFn: () => preloadImage(src),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });
}
