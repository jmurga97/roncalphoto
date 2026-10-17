import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Portfolio data only changes through admin mutations, which invalidate explicitly.
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}
