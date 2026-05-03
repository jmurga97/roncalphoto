import { createAuthClient, emailOtpClient } from "@roncal/auth/client";
import { resolveAuthBaseUrl } from "@roncal/shared";

const AUTH_BASE_URL = resolveAuthBaseUrl({
  viteApiUrl: import.meta.env.VITE_API_URL,
  legacyApiUrl: import.meta.env.API_URL,
});

const betterAuthClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  plugins: [emailOtpClient()],
});

export const authClient = Object.assign(betterAuthClient, {
  emailOtp: {
    ...betterAuthClient.emailOtp,
    signIn: betterAuthClient.signIn.emailOtp,
  },
});

export const { signOut, useSession } = authClient;
