import { getOrCreateInstance } from "@/shared/lib/instance-cache";
import { drizzle } from "drizzle-orm/d1";
import * as authSchema from "./schema/auth";

export * from "./schema/auth";

export function createAuthDb(client: D1Database) {
  return drizzle(client, { schema: authSchema });
}

export type AuthDb = ReturnType<typeof createAuthDb>;
const authDbInstances = new WeakMap<D1Database, AuthDb>();

export function getAuthDb(client: D1Database): AuthDb {
  return getOrCreateInstance(authDbInstances, client, () => createAuthDb(client));
}
