import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

import type { D1Database } from "@cloudflare/workers-types";

export function createDb(client: D1Database) {
  return drizzle(client, { schema });
}

export type AppDb = ReturnType<typeof createDb>;
