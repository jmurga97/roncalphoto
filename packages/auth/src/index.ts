import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import {
  OTP_EXPIRES_IN_LABEL,
  OTP_EXPIRES_IN_SECONDS,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  SESSION_EXPIRES_IN_SECONDS,
} from "./store";

export * from "./store";

const EMAIL_WORKER_OTP_PATH = "https://email-worker.internal/send/otp";

type DrizzleAdapterDatabase = Parameters<typeof drizzleAdapter>[0];

export type AuthDatabase = DrizzleAdapterDatabase;
export type AuthSchema = Record<string, unknown>;
export type AuthCookieMode = "same-site" | "cross-site";
export type EmailOtpType = "sign-in" | "email-verification" | "forget-password" | "change-email";

export interface EmailWorkerBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface SendEmailOtpPayload {
  email: string;
  otp: string;
  type: EmailOtpType;
}

export type EmailOtpSender = (payload: SendEmailOtpPayload) => Promise<void>;

export interface CreateEmailWorkerOtpSenderOptions {
  expiresInLabel?: string;
  worker: EmailWorkerBinding;
}

export interface CreateAuthOptions {
  db: AuthDatabase;
  schema?: AuthSchema;
  secret: string;
  baseURL?: string;
  trustedOrigins?: string[];
  emailOtpSender: EmailOtpSender;
  cookieMode?: AuthCookieMode;
}

type BetterAuthInstance = ReturnType<typeof betterAuth>;

export interface Auth {
  handler: BetterAuthInstance["handler"];
  api: BetterAuthInstance["api"];
  $Infer: BetterAuthInstance["$Infer"];
}

export type Session = Auth["$Infer"]["Session"];

interface SendOtpPayload {
  to: string;
  otp: string;
  expiresIn: string;
}

interface EmailWorkerErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
  data?: {
    code?: string;
    message?: string;
  };
}

async function resolveEmailWorkerError(response: Response): Promise<string> {
  try {
    const body = (await response.clone().json()) as EmailWorkerErrorBody;
    const details = body.error ?? body.data;

    if (details?.code && details.message) {
      return `${details.code}: ${details.message}`;
    }

    if (details?.message) {
      return details.message;
    }

    if (details?.code) {
      return details.code;
    }
  } catch {
    // Fall through to status text when the worker did not return JSON.
  }

  return response.statusText || `HTTP ${response.status}`;
}

async function sendOtpToEmailWorker(
  options: CreateEmailWorkerOtpSenderOptions,
  payload: SendOtpPayload,
): Promise<void> {
  const response = await options.worker.fetch(EMAIL_WORKER_OTP_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorDetails = await resolveEmailWorkerError(response);
    throw new Error(`Email worker rejected OTP delivery (${response.status}): ${errorDetails}`);
  }
}

export function createEmailWorkerOtpSender(
  options: CreateEmailWorkerOtpSenderOptions,
): EmailOtpSender {
  return async ({ email, otp }) => {
    await sendOtpToEmailWorker(options, {
      to: email,
      otp,
      expiresIn: options.expiresInLabel ?? OTP_EXPIRES_IN_LABEL,
    });
  };
}

function getAdvancedCookieOptions(cookieMode: AuthCookieMode) {
  if (cookieMode !== "cross-site") {
    return undefined;
  }

  return {
    defaultCookieAttributes: {
      partitioned: true,
      sameSite: "none" as const,
      secure: true,
    },
    useSecureCookies: true,
  };
}

export function createAuth({
  db,
  schema,
  secret,
  baseURL,
  trustedOrigins,
  emailOtpSender,
  cookieMode = "same-site",
}: CreateAuthOptions): Auth {
  return betterAuth({
    secret,
    baseURL,
    basePath: "/api/auth",
    database: drizzleAdapter(db as DrizzleAdapterDatabase, {
      provider: "sqlite",
      schema,
    }),
    session: {
      expiresIn: SESSION_EXPIRES_IN_SECONDS,
    },
    trustedOrigins,
    advanced: getAdvancedCookieOptions(cookieMode),
    plugins: [
      emailOTP({
        disableSignUp: true,
        otpLength: OTP_LENGTH,
        expiresIn: OTP_EXPIRES_IN_SECONDS,
        allowedAttempts: OTP_MAX_ATTEMPTS,
        storeOTP: "hashed",
        async sendVerificationOTP({ email, otp, type }) {
          await emailOtpSender({ email, otp, type });
        },
      }),
    ],
  });
}
