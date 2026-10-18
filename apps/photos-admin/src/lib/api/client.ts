import { fixtureResponse } from "@roncal/api/dev-fixtures";
import { getDataMode } from "@roncal/ui";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { queryClient } from "../query-client";

import type { AppRouter } from "@roncal/api/router";

export const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${location.hostname}:8787` : "https://api.murga.ing");

export const dataMode = import.meta.env.DEV ? getDataMode() : "demo";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      fetch: (url, options) => {
        const fixture = import.meta.env.DEV ? fixtureResponse(dataMode, url) : null;

        return fixture ? Promise.resolve(fixture) : fetch(url, { ...options, credentials: "include" });
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });

/** Sessions, photos and tags reference each other: after any write, refresh every tRPC query. */
export function invalidatePortfolio() {
  return queryClient.invalidateQueries({ queryKey: trpc.pathKey() });
}
