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
