import type { ApiResponse, PaginatedResponse } from "@roncal/shared";

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

async function resolveApiErrorMessage(response: Response): Promise<string> {
  try {
    const json = (await response.clone().json()) as ApiResponse<unknown>;
    return json.error ? ` - ${json.error}` : "";
  } catch {
    return "";
  }
}

export const httpClient: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && shouldSetJsonContentType(init?.body)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(resolveRequestInput(input), {
    ...init,
    credentials: init?.credentials ?? "include",
    headers,
  });
};

export async function readApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiRequestError(
      `API error: ${response.status} ${response.statusText}${await resolveApiErrorMessage(response)}`,
      response.status,
    );
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success || json.data === undefined) {
    throw new ApiRequestError(json.error || "Unknown API error", response.status);
  }

  return json.data;
}

export async function readPaginatedApiResponse<T>(
  response: Response,
): Promise<PaginatedResponse<T>> {
  if (!response.ok) {
    throw new ApiRequestError(
      `API error: ${response.status} ${response.statusText}${await resolveApiErrorMessage(response)}`,
      response.status,
    );
  }

  const json = (await response.json()) as PaginatedResponse<T> & {
    error?: string;
  };

  if (!json.success || !Array.isArray(json.data) || !json.pagination) {
    throw new ApiRequestError(json.error || "Unknown paginated API error", response.status);
  }

  return json;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado.";
}
