const OTP_EXPIRES_IN_SECONDS = 300;
const OTP_EXPIRES_IN_LABEL = "5 minutos";
const OTP_LENGTH = 6;
const OTP_MAX_ATTEMPTS = 3;
const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

export {
  OTP_EXPIRES_IN_SECONDS,
  OTP_EXPIRES_IN_LABEL,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  SESSION_EXPIRES_IN_SECONDS,
};

export interface AuthKeyValueStore {
  delete(key: string): Promise<void>;
  getJson<T>(key: string): Promise<T | null>;
  setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
}

interface MemoryAuthEntry {
  expiresAt?: number;
  value: string;
}

const memoryAuthStore = new Map<string, MemoryAuthEntry>();

function authUserByEmailKey(email: string): string {
  return `auth:user:email:${email}`;
}

function authUserByIdKey(id: string): string {
  return `auth:user:id:${id}`;
}

function authOtpKey(email: string): string {
  return `auth:otp:${email}:sign-in`;
}

function authSessionKey(tokenHash: string): string {
  return `auth:session:${tokenHash}`;
}

export { authUserByEmailKey, authUserByIdKey, authOtpKey, authSessionKey };

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateOtp(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % 10 ** OTP_LENGTH).padStart(OTP_LENGTH, "0");
}

async function hmacHex(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return toHex(signature);
}

async function hashOtp(secret: string, email: string, otp: string): Promise<string> {
  return hmacHex(secret, `${email}:sign-in:${otp}`);
}

async function hashSessionToken(secret: string, token: string): Promise<string> {
  return hmacHex(secret, token);
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

export { toHex, generateToken, generateOtp, hmacHex, hashOtp, hashSessionToken, constantTimeEqual };

export function createMemoryStore(): AuthKeyValueStore {
  return {
    async delete(key) {
      memoryAuthStore.delete(key);
    },
    async getJson<T>(key: string): Promise<T | null> {
      const entry = memoryAuthStore.get(key);

      if (!entry) {
        return null;
      }

      if (entry.expiresAt && entry.expiresAt <= Date.now()) {
        memoryAuthStore.delete(key);
        return null;
      }

      return JSON.parse(entry.value) as T;
    },
    async setJson<T>(key: string, value: T, ttlSeconds?: number) {
      memoryAuthStore.set(key, {
        value: JSON.stringify(value),
        ...(ttlSeconds ? { expiresAt: Date.now() + ttlSeconds * 1000 } : {}),
      });
    },
  };
}

export function createKvStore(kv: KVNamespace): AuthKeyValueStore {
  return {
    async delete(key) {
      await kv.delete(key);
    },
    async getJson<T>(key: string): Promise<T | null> {
      return kv.get<T>(key, "json");
    },
    async setJson<T>(key: string, value: T, ttlSeconds?: number) {
      await kv.put(key, JSON.stringify(value), ttlSeconds ? { expirationTtl: ttlSeconds } : {});
    },
  };
}

export class AuthStoreError extends Error {
  constructor(message = "Auth store is not configured") {
    super(message);
    this.name = "AuthStoreError";
  }
}

export function createAuthStore(
  kv: KVNamespace | undefined,
  isProduction: boolean,
): AuthKeyValueStore {
  if (kv) {
    return createKvStore(kv);
  }

  if (isProduction) {
    throw new AuthStoreError(
      "Auth KV store is required in production. Provide a KVNamespace binding.",
    );
  }

  return createMemoryStore();
}
