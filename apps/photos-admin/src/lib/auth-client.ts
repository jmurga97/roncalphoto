import { createAuthClient, emailOtpClient } from "@roncal/auth/client";

const AUTH_BASE_URL =
  import.meta.env.API_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:8787";

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
