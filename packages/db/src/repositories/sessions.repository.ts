import { and, asc, desc, eq, inArray, like, ne, or } from "drizzle-orm";

import { toSession } from "../mappers";
import { photos, sessions, sessionTags } from "../schema";

import type { AppDb } from "../client";

export type SessionValues = Pick<typeof sessions.$inferInsert, "slug" | "title" | "description">;

function withRelations() {
  return {
    photos: { orderBy: [asc(photos.sortOrder), asc(photos.id)] },
    sessionTags: { with: { tag: true as const } },
  };
}

function tagRows(sessionId: string, tagIds: string[]) {
  return tagIds.map((tagId) => ({ sessionId, tagId }));
}

export async function list(db: AppDb, { tagId }: { tagId?: string } = {}) {
  const taggedSessions = tagId
    ? db.select({ id: sessionTags.sessionId }).from(sessionTags).where(eq(sessionTags.tagId, tagId))
    : undefined;
  const rows = await db.query.sessions.findMany({
    where: taggedSessions ? inArray(sessions.id, taggedSessions) : undefined,
    orderBy: [desc(sessions.createdAt), desc(sessions.id)],
    with: withRelations(),
  });

  return rows.map((item) => toSession(item));
}

export async function findBySlug(db: AppDb, slug: string) {
  const row = await db.query.sessions.findFirst({
    where: eq(sessions.slug, slug),
    with: withRelations(),
  });

  return row ? toSession(row) : null;
}

/** Slugs equal to `baseSlug` or suffixed (`baseSlug-2`…), to pick the next free one. */
export async function listSlugsLike(db: AppDb, baseSlug: string, excludeId?: string) {
  const matches = or(eq(sessions.slug, baseSlug), like(sessions.slug, `${baseSlug}-%`));
  const rows = await db
    .select({ slug: sessions.slug })
    .from(sessions)
    .where(excludeId ? and(matches, ne(sessions.id, excludeId)) : matches);

  return rows.map((row) => row.slug);
}

// Tag links reference `tags` by FK: an unknown tag id fails the whole batch (D1 batches are atomic).
export async function insert(db: AppDb, values: SessionValues, tagIds: string[]) {
  const id = crypto.randomUUID();

  await db.batch([db.insert(sessions).values({ id, ...values }), db.insert(sessionTags).values(tagRows(id, tagIds))]);
}

export async function update(db: AppDb, id: string, values: SessionValues, tagIds?: string[]) {
  const updateSession = db.update(sessions).set(values).where(eq(sessions.id, id));

  if (!tagIds) {
    await updateSession;
    return;
  }

  await db.batch([
    updateSession,
    db.delete(sessionTags).where(eq(sessionTags.sessionId, id)),
    db.insert(sessionTags).values(tagRows(id, tagIds)),
  ]);
}

export async function removeBySlug(db: AppDb, slug: string) {
  const row = await db.delete(sessions).where(eq(sessions.slug, slug)).returning({ id: sessions.id }).get();

  return row ?? null;
}
