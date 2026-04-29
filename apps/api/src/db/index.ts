import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export * from "./schema";

export function createDb(client: D1Database) {
  return drizzle(client, { schema });
}

export type AppDb = ReturnType<typeof createDb>;
const dbInstances = new WeakMap<D1Database, AppDb>();

export function getDb(client: D1Database): AppDb {
  const existingDb = dbInstances.get(client);

  if (existingDb) {
    return existingDb;
  }

  const db = createDb(client);
  dbInstances.set(client, db);

  return db;
}

export type AppTransaction = Parameters<AppDb["transaction"]>[0] extends (
  tx: infer Transaction,
  ...args: never[]
) => unknown
  ? Transaction
  : never;
export type DbExecutor = AppDb | AppTransaction;
