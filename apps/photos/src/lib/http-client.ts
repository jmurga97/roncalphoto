import type { ApiResponse } from "@roncal/shared";

const API_URL = import.meta.env.API_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function shouldSetJsonContentType(body: BodyInit | null | undefined): boolean {
  if (body == null) {
    return false;
  }

  return !(
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof ReadableStream
  );
}

function resolveRequestInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input !== "string" || !input.startsWith("/")) {
    return input;
  }

  return `${API_URL}${input}`;
}

export const httpClient: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && shouldSetJsonContentType(init?.body)) {
    headers.set("Content-Type", "application/json");
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
