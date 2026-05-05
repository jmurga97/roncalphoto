const CANONICAL_API_BASE_URL = "https://api.murga.ing";
const LOCAL_API_BASE_URL = "http://localhost:8787";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export interface ApiBaseUrlOptions {
  viteApiUrl?: string | null;
  currentOrigin?: string | null;
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function getCurrentOrigin(): string | null {
  const globalScope = globalThis as {
    location?: {
      origin?: string;
    };
  };

  return typeof globalScope.location?.origin === "string" ? globalScope.location.origin : null;
}

function isLocalOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.replace(/^\[(.*)\]$/, "$1");

    return LOCAL_HOSTNAMES.has(hostname);
  } catch {
    return false;
  }
}

export function resolveApiBaseUrl(options: ApiBaseUrlOptions = {}): string {
  const override = options.viteApiUrl?.trim();

  if (override) {
    return normalizeBaseUrl(override);
  }

  const currentOrigin = options.currentOrigin?.trim() || getCurrentOrigin();

  if (currentOrigin && isLocalOrigin(currentOrigin)) {
    return LOCAL_API_BASE_URL;
  }

  return CANONICAL_API_BASE_URL;
}
