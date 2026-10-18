import { fixtureResponse } from "@roncal/api/dev-fixtures";
import { getDataMode } from "@roncal/ui";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { DEFAULT_API_URL } from "./config";
import { queryClient } from "../query-client";

import type { AppRouter } from "@roncal/api/router";

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${location.hostname}:8787` : DEFAULT_API_URL);

const dataMode = import.meta.env.DEV ? getDataMode() : "demo";

// The public site only reads public procedures: never send the admin session cookie.
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      fetch: (url, options) => {
        const fixture = import.meta.env.DEV ? fixtureResponse(dataMode, url) : null;

        return fixture ? Promise.resolve(fixture) : fetch(url, { ...options, credentials: "omit" });
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });
