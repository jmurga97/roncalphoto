import type { ApiResponse } from "./types";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function shouldSetJsonContentType(body: BodyInit | null | undefined): boolean {
  if (body === null || body === undefined) return false;
  return !(
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof ReadableStream
  );
}

async function resolveApiErrorMessage(response: Response): Promise<string> {
  try {
    const json = (await response.clone().json()) as ApiResponse<unknown>;
    return json.error ? ` - ${json.error}` : "";
  } catch {
    return "";
  }
}

export interface HttpClientOptions {
  baseUrl: string;
  credentials?: "omit" | "same-origin" | "include";
}

export class HttpClient {
  private baseUrl: string;
  private credentials?: "omit" | "same-origin" | "include";

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.credentials = options.credentials;
  }

  private resolveUrl(input: string): string {
    return input.startsWith("/") ? `${this.baseUrl}${input}` : input;
  }

  private async fetch(input: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type") && shouldSetJsonContentType(init?.body)) {
      headers.set("Content-Type", "application/json");
    }
    const options: Parameters<typeof fetch>[1] = { ...init, headers };
    if (this.credentials) {
      (options as Record<string, unknown>).credentials = this.credentials;
    }
    return fetch(this.resolveUrl(input), options);
  }

  private async parse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const suffix = await resolveApiErrorMessage(response);
      throw new ApiRequestError(
        `API error: ${response.status} ${response.statusText}${suffix}`,
        response.status,
      );
    }
    const json = (await response.json()) as ApiResponse<T>;
    if (!json.success || json.data === undefined) {
      throw new ApiRequestError(json.error || "Unknown API error", response.status);
    }
    return json.data;
  }

  async get<T>(input: string): Promise<T> {
    return this.parse<T>(await this.fetch(input, { method: "GET" }));
  }

  async post<T>(input: string, body?: unknown): Promise<T> {
    return this.parse<T>(
      await this.fetch(input, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    );
  }

  async put<T>(input: string, body?: unknown): Promise<T> {
    return this.parse<T>(
      await this.fetch(input, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
    );
  }

  async delete<T>(input: string): Promise<T> {
    return this.parse<T>(await this.fetch(input, { method: "DELETE" }));
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ha ocurrido un error inesperado.";
}
