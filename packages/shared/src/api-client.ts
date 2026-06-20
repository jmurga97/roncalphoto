import { HttpClient } from "./http-client";
import { resolveApiBaseUrl } from "./runtime";

import type { HttpClientOptions } from "./http-client";

export interface CreateApiClientOptions {
  viteApiUrl?: string | null;
  credentials?: HttpClientOptions["credentials"];
}

export function createApiClient(options: CreateApiClientOptions = {}): HttpClient {
  return new HttpClient({
    baseUrl: resolveApiBaseUrl({
      viteApiUrl: options.viteApiUrl,
    }),
    credentials: options.credentials,
  });
}
