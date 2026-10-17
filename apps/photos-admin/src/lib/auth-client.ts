import { createEmailOtpAuthClient } from "@roncal/auth/client";

import { API_URL } from "./api/client";

export const authClient = createEmailOtpAuthClient(`${API_URL}/api/auth`);

/** Better Auth resolves with `{ error }` instead of throwing. */
export function assertAuthResult(result: { error?: { message?: string; statusText?: string } | null }) {
  if (result.error) {
    throw new Error(result.error.message ?? result.error.statusText ?? "Autenticación rechazada.");
  }
}

export async function signOut(): Promise<void> {
  assertAuthResult(await authClient.signOut());
}
