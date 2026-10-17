import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";

const OTP_LENGTH = 6;
const OTP_MAX_ATTEMPTS = 3;
const OTP_EXPIRES_IN_SECONDS = 5 * 60;
const SESSION_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;
const EMAIL_WORKER_SEND_URL = "https://email-worker.internal/send?productId=roncalphoto";

export interface EmailWorkerBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface CreateAuthOptions {
  db: Parameters<typeof drizzleAdapter>[0];
  schema: Record<string, unknown>;
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
  emailWorker: EmailWorkerBinding;
  /** `cross-site` when the admin and the API live on different sites (production). */
  cookieMode: "same-site" | "cross-site";
  /** Development only: every sign-in OTP is this value and no email is sent. */
  fixedOtp?: string;
}

async function sendOtpEmail(emailWorker: EmailWorkerBinding, email: string, otp: string) {
  const response = await emailWorker.fetch(EMAIL_WORKER_SEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      template: "otp",
      fromProfile: "roncalphoto-default",
      to: email,
      data: { otp, expiresIn: "5 minutos" },
      metadata: { source: "auth" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Email worker rejected OTP delivery (${response.status}): ${await response.text()}`);
  }
}

export function createAuth({
  db,
  schema,
  secret,
  baseURL,
  trustedOrigins,
  emailWorker,
  cookieMode,
  fixedOtp,
}: CreateAuthOptions) {
  return betterAuth({
    secret,
    baseURL,
    basePath: "/api/auth",
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    session: { expiresIn: SESSION_EXPIRES_IN_SECONDS },
    trustedOrigins,
    advanced:
      cookieMode === "cross-site"
        ? {
            useSecureCookies: true,
            defaultCookieAttributes: { partitioned: true, sameSite: "none", secure: true },
          }
        : undefined,
    plugins: [
      emailOTP({
        // Only pre-provisioned admin accounts can sign in.
        disableSignUp: true,
        otpLength: OTP_LENGTH,
        expiresIn: OTP_EXPIRES_IN_SECONDS,
        allowedAttempts: OTP_MAX_ATTEMPTS,
        storeOTP: "hashed",
        generateOTP: () => fixedOtp,
        sendVerificationOTP: async ({ email, otp }) => {
          if (!fixedOtp) await sendOtpEmail(emailWorker, email, otp);
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
