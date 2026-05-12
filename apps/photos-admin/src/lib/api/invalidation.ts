import { adminQueryKeys } from "./query-keys";

import type { QueryClient } from "@tanstack/react-query";

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
