import type { emailOTPClient } from "better-auth/client/plugins";
import type { createAuthClient as createBetterAuthClient } from "better-auth/react";

export declare const createAuthClient: typeof createBetterAuthClient;
export declare const emailOtpClient: typeof emailOTPClient;

export declare const authClient: ReturnType<
  typeof createBetterAuthClient<{
    plugins: [ReturnType<typeof emailOTPClient>];
  }>
>;

export declare const signOut: typeof authClient.signOut;
export declare const useSession: typeof authClient.useSession;
