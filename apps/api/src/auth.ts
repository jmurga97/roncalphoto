import { getAuthRuntimeEnv, getRuntimeEnv, isProductionEnv } from "@/config/env";
import { BAD_REQUEST, NOT_FOUND, OK, UNAUTHORIZED } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import { HttpError } from "@/shared/errors";
import { jsonSuccess } from "@/shared/lib/http";
import {
  type AuthKeyValueStore,
  OTP_EXPIRES_IN_LABEL,
  OTP_EXPIRES_IN_SECONDS,
  OTP_MAX_ATTEMPTS,
  SESSION_EXPIRES_IN_SECONDS,
  authOtpKey,
  authSessionKey,
  authUserByEmailKey,
  authUserByIdKey,
  constantTimeEqual,
  createAuthStore,
  generateOtp,
  generateToken,
  hashOtp,
  hashSessionToken,
} from "@roncal/auth";
import type { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const AUTH_COOKIE_NAME = "roncalphoto_admin_session";
const EMAIL_WORKER_OTP_PATH = "https://email-worker.internal/send/otp";

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

interface SendOtpPayload {
  to: string;
  otp: string;
  expiresIn: string;
}

interface StoredOtp {
  attempts: number;
  email: string;
  expiresAt: string;
  otpHash: string;
  type: "sign-in";
}

interface StoredSession {
  createdAt: string;
  expiresAt: string;
  id: string;
  ipAddress: string | null;
  updatedAt: string;
  userAgent: string | null;
  userId: string;
}

interface StoredUser {
  createdAt: string;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  updatedAt: string;
}

interface AuthSession {
  session: StoredSession;
  user: StoredUser;
}

interface D1UserRow {
  createdAt: number;
  email: string;
  emailVerified: number;
  id: string;
  image: string | null;
  name: string;
  updatedAt: number;
}

function createAuthConfigError() {
  return new HttpError(
    BAD_REQUEST,
    "Auth is not configured. Set BETTER_AUTH_SECRET, PHOTOS_ADMIN_URL, AUTH_KV, and configure the EMAIL_WORKER service binding or the EMAIL_WORKER_URL and EMAIL_WORKER_API_KEY fallback.",
  );
}

export function getConfiguredAuthEnv(c: Context<AppBindings>) {
  try {
    return getAuthRuntimeEnv(c);
  } catch {
    throw createAuthConfigError();
  }
}

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function normalizeOtp(otp: unknown): string | null {
  if (typeof otp !== "string") {
    return null;
  }

  const normalized = otp.trim();

  return /^\d{6}$/.test(normalized) ? normalized : null;
}

function getAuthStore(c: Context<AppBindings>): AuthKeyValueStore {
  try {
    return createAuthStore(c.env.AUTH_KV, isProductionEnv(getRuntimeEnv(c)));
  } catch {
    throw createAuthConfigError();
  }
}

function toIsoDateFromUnixSeconds(value: number): string {
  return new Date(value * 1000).toISOString();
}

function mapD1User(row: D1UserRow): StoredUser {
  return {
    createdAt: toIsoDateFromUnixSeconds(row.createdAt),
    email: row.email.toLowerCase(),
    emailVerified: row.emailVerified === 1,
    id: row.id,
    image: row.image,
    name: row.name,
    updatedAt: toIsoDateFromUnixSeconds(row.updatedAt),
  };
}

async function queryD1UserByEmail(
  c: Context<AppBindings>,
  email: string,
): Promise<StoredUser | null> {
  try {
    const row = await c.env.DB_RONCALPHOTO.prepare(
      'SELECT id, name, email, emailVerified, image, createdAt, updatedAt FROM "user" WHERE lower(email) = ? LIMIT 1',
    )
      .bind(email)
      .first<D1UserRow>();

    return row ? mapD1User(row) : null;
  } catch {
    return null;
  }
}

async function queryD1UserById(c: Context<AppBindings>, id: string): Promise<StoredUser | null> {
  try {
    const row = await c.env.DB_RONCALPHOTO.prepare(
      'SELECT id, name, email, emailVerified, image, createdAt, updatedAt FROM "user" WHERE id = ? LIMIT 1',
    )
      .bind(id)
      .first<D1UserRow>();

    return row ? mapD1User(row) : null;
  } catch {
    return null;
  }
}

async function persistUser(store: AuthKeyValueStore, user: StoredUser): Promise<void> {
  await Promise.all([
    store.setJson(authUserByEmailKey(user.email), user.id),
    store.setJson(authUserByIdKey(user.id), user),
  ]);
}

async function findAuthorizedUserByEmail(
  c: Context<AppBindings>,
  store: AuthKeyValueStore,
  email: string,
): Promise<StoredUser | null> {
  const userId = await store.getJson<string>(authUserByEmailKey(email));
  const kvUser = userId ? await store.getJson<StoredUser>(authUserByIdKey(userId)) : null;

  if (kvUser?.email === email) {
    return kvUser;
  }

  const d1User = await queryD1UserByEmail(c, email);

  if (d1User) {
    await persistUser(store, d1User);
  }

  return d1User;
}

async function findAuthorizedUserById(
  c: Context<AppBindings>,
  store: AuthKeyValueStore,
  id: string,
): Promise<StoredUser | null> {
  const kvUser = await store.getJson<StoredUser>(authUserByIdKey(id));

  if (kvUser) {
    return kvUser;
  }

  const d1User = await queryD1UserById(c, id);

  if (d1User) {
    await persistUser(store, d1User);
  }

  return d1User;
}

function resolveEmailWorkerOtpUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/send/otp`;
}

function shouldUseEmailWorkerUrl(c: Context<AppBindings>): boolean {
  const runtimeEnv = getRuntimeEnv(c);
  const authEnv = getConfiguredAuthEnv(c);

  return runtimeEnv.NODE_ENV !== "production" && Boolean(authEnv.EMAIL_WORKER_URL?.trim());
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
  c: Context<AppBindings>,
  payload: SendOtpPayload,
): Promise<void> {
  const authEnv = getConfiguredAuthEnv(c);
  const request: RequestInit = {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  };
  let response: Response;

  if (!shouldUseEmailWorkerUrl(c) && authEnv.EMAIL_WORKER) {
    response = await authEnv.EMAIL_WORKER.fetch(EMAIL_WORKER_OTP_PATH, request);
  } else {
    const url = authEnv.EMAIL_WORKER_URL?.trim();
    const apiKey = authEnv.EMAIL_WORKER_API_KEY?.trim();

    if (!url || !apiKey) {
      throw createAuthConfigError();
    }

    const headers = new Headers(request.headers);
    headers.set("X-Api-Key", apiKey);

    response = await fetch(resolveEmailWorkerOtpUrl(url), {
      ...request,
      headers,
    });
  }

  if (!response.ok) {
    const errorDetails = await resolveEmailWorkerError(response);
    throw new Error(`Email worker rejected OTP delivery (${response.status}): ${errorDetails}`);
  }
}

function getCookieOptions(c: Context<AppBindings>) {
  return {
    httpOnly: true,
    maxAge: SESSION_EXPIRES_IN_SECONDS,
    path: "/",
    sameSite: "Lax" as const,
    secure: isProductionEnv(getRuntimeEnv(c)),
  };
}

function clearSessionCookie(c: Context<AppBindings>) {
  setCookie(c, AUTH_COOKIE_NAME, "", {
    ...getCookieOptions(c),
    maxAge: 0,
  });
}

function getRequestIp(c: Context<AppBindings>): string | null {
  const forwardedFor = c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

  return c.req.header("CF-Connecting-IP") ?? forwardedFor ?? null;
}

function getRequestUserAgent(c: Context<AppBindings>): string | null {
  return c.req.header("User-Agent") ?? null;
}

async function readJsonObject(c: Context<AppBindings>): Promise<Record<string, unknown>> {
  const body = await c.req.json();

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(BAD_REQUEST, "Request body must be a JSON object");
  }

  return body as Record<string, unknown>;
}

async function handleSendVerificationOtp(c: Context<AppBindings>) {
  const authEnv = getConfiguredAuthEnv(c);
  const store = getAuthStore(c);
  const body = await readJsonObject(c);
  const email = normalizeEmail(body.email);

  if (!email || (body.type && body.type !== "sign-in")) {
    throw new HttpError(BAD_REQUEST, "Expected { email, type: 'sign-in' }");
  }

  const user = await findAuthorizedUserByEmail(c, store, email);

  if (!user) {
    return jsonSuccess(c, { sent: false }, OK);
  }

  const otp = generateOtp();
  const otpRecord: StoredOtp = {
    attempts: 0,
    email,
    expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_SECONDS * 1000).toISOString(),
    otpHash: await hashOtp(authEnv.BETTER_AUTH_SECRET, email, otp),
    type: "sign-in",
  };

  await store.setJson(authOtpKey(email), otpRecord, OTP_EXPIRES_IN_SECONDS);

  try {
    await sendOtpToEmailWorker(c, {
      expiresIn: OTP_EXPIRES_IN_LABEL,
      otp,
      to: email,
    });
  } catch (error) {
    await store.delete(authOtpKey(email));
    throw error;
  }

  return jsonSuccess(c, { sent: true }, OK);
}

function remainingTtlSeconds(expiresAt: string): number {
  return Math.max(1, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

async function handleSignInEmailOtp(c: Context<AppBindings>) {
  const authEnv = getConfiguredAuthEnv(c);
  const store = getAuthStore(c);
  const body = await readJsonObject(c);
  const email = normalizeEmail(body.email);
  const otp = normalizeOtp(body.otp);

  if (!email || !otp) {
    throw new HttpError(BAD_REQUEST, "Expected { email, otp }");
  }

  const otpKey = authOtpKey(email);
  const otpRecord = await store.getJson<StoredOtp>(otpKey);

  if (!otpRecord || new Date(otpRecord.expiresAt).getTime() <= Date.now()) {
    await store.delete(otpKey);
    throw new HttpError(UNAUTHORIZED, "Invalid or expired OTP");
  }

  const incomingOtpHash = await hashOtp(authEnv.BETTER_AUTH_SECRET, email, otp);

  if (!constantTimeEqual(incomingOtpHash, otpRecord.otpHash)) {
    const nextAttempts = otpRecord.attempts + 1;

    if (nextAttempts >= OTP_MAX_ATTEMPTS) {
      await store.delete(otpKey);
    } else {
      await store.setJson(
        otpKey,
        {
          ...otpRecord,
          attempts: nextAttempts,
        },
        remainingTtlSeconds(otpRecord.expiresAt),
      );
    }

    throw new HttpError(UNAUTHORIZED, "Invalid or expired OTP");
  }

  const user = await findAuthorizedUserByEmail(c, store, email);

  if (!user) {
    await store.delete(otpKey);
    throw new HttpError(UNAUTHORIZED, "Invalid or expired OTP");
  }

  await store.delete(otpKey);

  const token = generateToken();
  const tokenHash = await hashSessionToken(authEnv.BETTER_AUTH_SECRET, token);
  const now = new Date();
  const session: StoredSession = {
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_EXPIRES_IN_SECONDS * 1000).toISOString(),
    id: crypto.randomUUID(),
    ipAddress: getRequestIp(c),
    updatedAt: now.toISOString(),
    userAgent: getRequestUserAgent(c),
    userId: user.id,
  };

  await store.setJson(authSessionKey(tokenHash), session, SESSION_EXPIRES_IN_SECONDS);
  setCookie(c, AUTH_COOKIE_NAME, token, getCookieOptions(c));

  return jsonSuccess(
    c,
    {
      session,
      user,
    } satisfies AuthSession,
    OK,
  );
}

async function getSessionFromCookie(c: Context<AppBindings>): Promise<AuthSession | null> {
  const token = getCookie(c, AUTH_COOKIE_NAME);

  if (!token) {
    return null;
  }

  const authEnv = getConfiguredAuthEnv(c);
  const store = getAuthStore(c);
  const tokenHash = await hashSessionToken(authEnv.BETTER_AUTH_SECRET, token);
  const sessionKey = authSessionKey(tokenHash);
  const session = await store.getJson<StoredSession>(sessionKey);

  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    await store.delete(sessionKey);
    clearSessionCookie(c);
    return null;
  }

  const user = await findAuthorizedUserById(c, store, session.userId);

  if (!user) {
    await store.delete(sessionKey);
    clearSessionCookie(c);
    return null;
  }

  return { session, user };
}

async function handleGetSession(c: Context<AppBindings>) {
  return jsonSuccess(c, await getSessionFromCookie(c), OK);
}

async function handleSignOut(c: Context<AppBindings>) {
  const token = getCookie(c, AUTH_COOKIE_NAME);

  if (token) {
    const authEnv = getConfiguredAuthEnv(c);
    const store = getAuthStore(c);
    const tokenHash = await hashSessionToken(authEnv.BETTER_AUTH_SECRET, token);
    await store.delete(authSessionKey(tokenHash));
  }

  clearSessionCookie(c);

  return jsonSuccess(c, { signedOut: true }, OK);
}

function getAuthRoute(path: string): string {
  return path.replace(/^\/api\/auth/, "") || "/";
}

export async function authHandler(c: Context<AppBindings>): Promise<Response> {
  const route = getAuthRoute(c.req.path);

  if (c.req.method === "GET" && route === "/get-session") {
    return handleGetSession(c);
  }

  if (c.req.method === "POST" && route === "/email-otp/send-verification-otp") {
    return handleSendVerificationOtp(c);
  }

  if (c.req.method === "POST" && route === "/sign-in/email-otp") {
    return handleSignInEmailOtp(c);
  }

  if (c.req.method === "POST" && route === "/sign-out") {
    return handleSignOut(c);
  }

  return c.json({ success: false as const, error: "Auth route not found" }, NOT_FOUND);
}

export async function requireSession(c: Context<AppBindings>, next: Next) {
  const session = await getSessionFromCookie(c);

  if (!session) {
    throw new HttpError(UNAUTHORIZED, "Unauthorized");
  }

  c.set("authSession", session);
  await next();
}
