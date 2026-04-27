import type { ApiResponse } from "@roncal/shared";

const API_URL =
  import.meta.env.API_URL ??
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "" : "http://localhost:8787");
const API_KEY = import.meta.env.API_KEY ?? import.meta.env.VITE_API_KEY ?? "";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function resolveRequestInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input !== "string" || !input.startsWith("/")) {
    return input;
  }

  return `${API_URL}${input}`;
}

export const httpClient: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("X-API-Key")) {
    headers.set("X-API-Key", API_KEY);
  }

  return fetch(resolveRequestInput(input), {
    ...init,
    headers,
  });
};

export async function readApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let apiErrorMessage = "";

    try {
      const json = (await response.clone().json()) as ApiResponse<unknown>;
      apiErrorMessage = json.error ? ` - ${json.error}` : "";
    } catch {
      apiErrorMessage = "";
    }

    throw new ApiRequestError(
      `API error: ${response.status} ${response.statusText}${apiErrorMessage}`,
      response.status,
    );
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success || json.data === undefined) {
    throw new ApiRequestError(json.error || "Unknown API error", response.status);
  }

  return json.data;
}
