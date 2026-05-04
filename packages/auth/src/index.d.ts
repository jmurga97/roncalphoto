export type AuthDatabase = unknown;

export interface EmailWorkerBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface AuthEnv {
  BETTER_AUTH_SECRET: string;
  PHOTOS_ADMIN_URL: string;
  NODE_ENV?: string;
  EMAIL_WORKER?: EmailWorkerBinding;
  EMAIL_WORKER_URL?: string;
  EMAIL_WORKER_API_KEY?: string;
}

export interface CreateAuthOptions {
  db: AuthDatabase;
  env: AuthEnv;
  fetcher?: typeof fetch;
  trustedOrigins?: string[];
}

export interface Auth {
  handler(request: Request): Response | Promise<Response>;
  api: {
    getSession(context: { headers: Headers }): Promise<Session | null>;
  };
}

export interface Session {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export declare function createAuth(options: CreateAuthOptions): Auth;

export declare const OTP_EXPIRES_IN_SECONDS: number;
export declare const OTP_EXPIRES_IN_LABEL: string;
export declare const OTP_LENGTH: number;
export declare const OTP_MAX_ATTEMPTS: number;
export declare const SESSION_EXPIRES_IN_SECONDS: number;

export interface AuthKeyValueStore {
  delete(key: string): Promise<void>;
  getJson<T>(key: string): Promise<T | null>;
  setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
}

export declare function authUserByEmailKey(email: string): string;
export declare function authUserByIdKey(id: string): string;
export declare function authOtpKey(email: string): string;
export declare function authSessionKey(tokenHash: string): string;

export declare function toHex(buffer: ArrayBuffer): string;
export declare function generateToken(): string;
export declare function generateOtp(): string;
export declare function hmacHex(secret: string, value: string): Promise<string>;
export declare function hashOtp(secret: string, email: string, otp: string): Promise<string>;
export declare function hashSessionToken(secret: string, token: string): Promise<string>;
export declare function constantTimeEqual(left: string, right: string): boolean;

export declare function createMemoryStore(): AuthKeyValueStore;
export declare function createKvStore(kv: KVNamespace): AuthKeyValueStore;

export declare class AuthStoreError extends Error {
  constructor(message?: string);
}

export declare function createAuthStore(
  kv: KVNamespace | undefined,
  isProduction: boolean,
): AuthKeyValueStore;
