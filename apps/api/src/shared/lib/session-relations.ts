import type { AppDb } from "@/db";
import { photos, sessionTags, tags } from "@/db";
import type { ApiPhoto, Tag } from "@roncal/shared";
import { asc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { toApiPhoto, toTag } from "./api-mappers";
import { groupValuesBy } from "./collections";

export async function listTagsBySessionIds(
  db: AppDb,
  sessionIds: string[],
): Promise<Map<string, Tag[]>> {
  if (sessionIds.length === 0) {
    return new Map();
  }

  const tagLookup = alias(tags, "tag_lookup");
  const rows = await db
    .select({
      sessionId: sessionTags.session_id,
      id: tagLookup.id,
      name: tagLookup.name,
      slug: tagLookup.slug,
    })
    .from(sessionTags)
    .innerJoin(tagLookup, eq(tagLookup.id, sessionTags.tag_id))
    .where(inArray(sessionTags.session_id, sessionIds))
    .orderBy(asc(tagLookup.name))
    .all();

  return groupValuesBy(rows, (row) => row.sessionId, toTag);
}

export async function listPhotosBySessionIds(
  db: AppDb,
  sessionIds: string[],
): Promise<Map<string, ApiPhoto[]>> {
  if (sessionIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select()
    .from(photos)
    .where(inArray(photos.session_id, sessionIds))
    .orderBy(asc(photos.session_id), asc(photos.sort_order), asc(photos.id))
    .all();

  return groupValuesBy(rows, (row) => row.session_id, toApiPhoto);
}
