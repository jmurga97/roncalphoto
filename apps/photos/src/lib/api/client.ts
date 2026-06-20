import { createApiClient } from "@roncal/shared";

export const apiClient = createApiClient({
  viteApiUrl: import.meta.env.VITE_API_URL,
});
