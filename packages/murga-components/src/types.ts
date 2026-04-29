export type MurgaHttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface MurgaPagination {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface MurgaApiSuccess<T> {
  success: true;
  data: T;
}

export interface MurgaApiPaginated<T> {
  success: true;
  data: T[];
  pagination: MurgaPagination;
}

export interface MurgaApiError {
  success: false;
  error: string;
  stack?: string;
}

export interface MurgaApiConfig {
  baseUrl: string;
  apiKey: string;
  headers?: Record<string, string>;
  fetcher?: typeof fetch;
}

export interface MurgaCrudEventDetail<TResponse = unknown> {
  resource: string;
  method: MurgaHttpMethod;
  params?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
  request?: unknown;
  response?: TResponse;
  error?: MurgaApiError;
}

export interface MurgaFieldChangeDetail<TValue = unknown> {
  name: string;
  value: TValue;
}
