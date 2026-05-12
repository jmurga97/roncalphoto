import type { RuntimeEnv } from "./types";

export const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:4321",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:4321",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
] as const;

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function parseAllowedOrigins(value?: string): string[] {
  const configuredOrigins = value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]));
}

export function isLocalDevelopmentOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.replace(/^\[(.*)\]$/, "$1");

    return (url.protocol === "http:" || url.protocol === "https:") && LOCAL_DEV_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export function resolveAllowedOrigin(
  origin: string | undefined,
  allowedOrigins: readonly string[],
  options?: {
    allowLocalDevelopmentOrigin?: boolean;
    missingOriginValue?: string | null;
    nodeEnv?: string;
  },
): string | null {
  if (!origin) {
    return options?.missingOriginValue ?? "*";
  }

  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  if (options?.allowLocalDevelopmentOrigin && options.nodeEnv !== "production") {
    return isLocalDevelopmentOrigin(origin) ? origin : null;
  }

  return null;
}

export function resolveAuthAllowedOrigins(
  runtimeEnv: Pick<RuntimeEnv, "allowedOrigins" | "NODE_ENV">,
  photosAdminUrl?: string | null,
): string[] {
  const allowedOrigins = new Set<string>();
  const canonicalOrigin = photosAdminUrl?.trim();

  if (canonicalOrigin) {
    allowedOrigins.add(canonicalOrigin);
  }

  if (runtimeEnv.NODE_ENV !== "production") {
    for (const origin of runtimeEnv.allowedOrigins) {
      if (isLocalDevelopmentOrigin(origin)) {
        allowedOrigins.add(origin);
      }
    }
  }

  return Array.from(allowedOrigins);
}
