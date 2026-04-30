import type { QueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "./query-keys";

export async function invalidateSessionData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.sessions.all }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.photos.all }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags.all }),
  ]);
}

export async function invalidatePhotoData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.photos.all }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.sessions.all }),
  ]);
}
