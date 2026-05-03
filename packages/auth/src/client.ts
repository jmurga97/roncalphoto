import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const CANONICAL_AUTH_BASE_URL = "https://api.roncalphoto.com/api/auth";
const LOCAL_AUTH_BASE_URL = "http://localhost:8787/api/auth";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export { createAuthClient };
export const emailOtpClient = emailOTPClient;

function getCurrentOrigin(): string | null {
  const globalScope = globalThis as {
    location?: {
      origin?: string;
    };
  };

  return typeof globalScope.location?.origin === "string" ? globalScope.location.origin : null;
}

function resolveAuthBaseUrl(): string {
  const currentOrigin = getCurrentOrigin();

  if (!currentOrigin) {
    return CANONICAL_AUTH_BASE_URL;
  }

  try {
    const url = new URL(currentOrigin);
    const hostname = url.hostname.replace(/^\[(.*)\]$/, "$1");

    return LOCAL_HOSTNAMES.has(hostname) ? LOCAL_AUTH_BASE_URL : CANONICAL_AUTH_BASE_URL;
  } catch {
    return CANONICAL_AUTH_BASE_URL;
  }
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(),
  plugins: [emailOTPClient()],
});

export const { signOut, useSession } = authClient;
