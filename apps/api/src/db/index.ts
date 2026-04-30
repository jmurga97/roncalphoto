import { drizzle } from "drizzle-orm/d1";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";
import * as schema from "./schema";

export * from "./schema";

export function createDb(client: D1Database) {
  return drizzle(client, { schema });
}

export type AppDb = ReturnType<typeof createDb>;
const dbInstances = new WeakMap<D1Database, AppDb>();

export function getDb(client: D1Database): AppDb {
  return getOrCreateInstance(dbInstances, client, () => createDb(client));
}

export type AppTransaction = Parameters<AppDb["transaction"]>[0] extends (
  tx: infer Transaction,
  ...args: never[]
) => unknown
  ? Transaction
  : never;
export type DbExecutor = AppDb | AppTransaction;
