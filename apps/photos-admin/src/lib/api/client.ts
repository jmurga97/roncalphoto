import { HttpClient, resolveApiBaseUrl } from "@roncal/shared";

export const apiClient = new HttpClient({
  baseUrl: resolveApiBaseUrl({
    viteApiUrl: import.meta.env.VITE_API_URL,
  }),
  credentials: "include",
});
