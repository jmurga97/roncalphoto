import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const DEFAULT_AUTH_BASE_URL = "http://localhost:8787/api/auth";

export { createAuthClient };
export const emailOtpClient = emailOTPClient;

function resolveAuthBaseURL(): string {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_BASE_URL;
  }

  return new URL("/api/auth", window.location.origin).toString();
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
  plugins: [emailOTPClient()],
});

export const { signOut, useSession } = authClient;
