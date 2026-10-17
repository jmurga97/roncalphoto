import { createDb } from "@roncal/db/client";

import { createApiAuth } from "../auth";

import type { RuntimeEnv } from "../config/env";
import type { Auth } from "@roncal/auth";

export function createContext(env: RuntimeEnv, request: Request) {
  const db = createDb(env.DB_RONCALPHOTO);
  let session: ReturnType<Auth["api"]["getSession"]> | undefined;

  return {
    db,
    env,
    // Lazy: public procedures never touch auth, and a batch of protected calls shares one lookup.
    getSession: () => (session ??= createApiAuth(db, env).api.getSession({ headers: request.headers })),
  };
}

export type TrpcContext = ReturnType<typeof createContext>;
