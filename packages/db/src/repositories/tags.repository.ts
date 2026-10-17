import { asc, eq } from "drizzle-orm";

import { tags } from "../schema";

import type { AppDb } from "../client";

export function list(db: AppDb) {
  return db.select().from(tags).orderBy(asc(tags.name));
}

export async function findBySlug(db: AppDb, slug: string) {
  return (await db.select().from(tags).where(eq(tags.slug, slug)).get()) ?? null;
}
