import { createEmailOtpAuthClient } from "@roncal/auth/client";
import { resolveApiBaseUrl } from "@roncal/shared";

const baseURL = `${resolveApiBaseUrl({
  viteApiUrl: import.meta.env.VITE_API_URL,
})}/api/auth`;

export const authClient = createEmailOtpAuthClient({ baseURL });

export type Session = typeof authClient.$Infer.Session;

interface AuthClientResult {
  error?: {
    message?: string;
    statusText?: string;
  } | null;
}

function assertAuthClientResult(result: AuthClientResult) {
  if (!result.error) {
    return;
  }

  throw new Error(result.error.message ?? result.error.statusText ?? "Autenticación rechazada.");
}

export async function signOut(): Promise<void> {
  const result = await authClient.signOut();
  assertAuthClientResult(result);
}
