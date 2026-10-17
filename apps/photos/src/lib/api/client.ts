import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { queryClient } from "../query-client";

import type { AppRouter } from "@roncal/api/router";

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8787" : "https://api.murga.ing");

// The public site only reads public procedures: never send the admin session cookie.
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      fetch: (url, options) => fetch(url, { ...options, credentials: "omit" }),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });
