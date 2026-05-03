import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";

const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
const OTP_EXPIRES_IN_SECONDS = 300;
const OTP_EXPIRES_IN_LABEL = "5 minutos";
const OTP_LENGTH = 6;

type DrizzleAdapterDatabase = Parameters<typeof drizzleAdapter>[0];

export type AuthDatabase = unknown;

export interface AuthEnv {
  BETTER_AUTH_SECRET: string;
  EMAIL_WORKER_URL: string;
  EMAIL_WORKER_API_KEY: string;
  PHOTOS_ADMIN_URL: string;
}

export interface CreateAuthOptions {
  db: AuthDatabase;
  env: AuthEnv;
  fetcher?: typeof fetch;
  trustedOrigins?: string[];
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

function resolveEmailWorkerOtpUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/send/otp`;
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
  env: AuthEnv,
  payload: SendOtpPayload,
  fetcher: typeof fetch,
): Promise<void> {
  const response = await fetcher(resolveEmailWorkerOtpUrl(env.EMAIL_WORKER_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.EMAIL_WORKER_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorDetails = await resolveEmailWorkerError(response);
    throw new Error(`Email worker rejected OTP delivery (${response.status}): ${errorDetails}`);
  }
}

export function createAuth({ db, env, fetcher = fetch, trustedOrigins }: CreateAuthOptions): Auth {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db as DrizzleAdapterDatabase, {
      provider: "sqlite",
    }),
    session: {
      expiresIn: SESSION_EXPIRES_IN_SECONDS,
    },
    trustedOrigins: trustedOrigins ?? [env.PHOTOS_ADMIN_URL],
    plugins: [
      emailOTP({
        disableSignUp: true,
        otpLength: OTP_LENGTH,
        expiresIn: OTP_EXPIRES_IN_SECONDS,
        async sendVerificationOTP({ email, otp }) {
          await sendOtpToEmailWorker(
            env,
            {
              to: email,
              otp,
              expiresIn: OTP_EXPIRES_IN_LABEL,
            },
            fetcher,
          );
        },
      }),
    ],
  });
}
