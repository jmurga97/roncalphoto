import { resolveApiBaseUrl } from "@roncal/shared";

const BASE = `${resolveApiBaseUrl({
  viteApiUrl: import.meta.env.VITE_API_URL,
})}/api/auth`;

export interface Session {
  session: {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    ipAddress: string | null;
    userAgent: string | null;
  };
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AuthErrorResult {
  error?: { message?: string; statusText?: string } | null;
}

async function api(path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    error?: { message?: string };
    data?: unknown;
  };
  if (!res.ok || !json.success)
    throw new Error(json.error?.message || res.statusText || "Request failed");
  return json.data;
}

export const authClient = {
  getSession: () => api("/get-session").then((d) => ({ data: d as Session | null })),
  emailOtp: {
    sendVerificationOtp: (p: { email: string; type: string }) =>
      api("/email-otp/send-verification-otp", p).then(() => ({
        error: null as AuthErrorResult["error"],
      })),
    signIn: (p: { email: string; otp: string }) =>
      api("/sign-in/email-otp", p).then(() => ({ error: null as AuthErrorResult["error"] })),
  },
};

export const signOut = () => api("/sign-out", {}) as Promise<void>;
