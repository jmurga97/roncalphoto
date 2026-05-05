import { resolveApiBaseUrl } from "@roncal/shared";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export { createAuthClient };
export const emailOtpClient = emailOTPClient;

export const authClient = createAuthClient({
  baseURL: `${resolveApiBaseUrl()}/api/auth`,
  plugins: [emailOTPClient()],
});

export const { signOut, useSession } = authClient;
