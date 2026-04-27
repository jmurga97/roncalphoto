import type { AppDb } from "@/db";
import { sessionTags, sessions, tags } from "@/db";
import { HttpError } from "@/shared/errors";
import type { ApiSession, ApiTagWithSessions, Tag } from "@roncal/shared";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { toApiSession, toTag } from "../utils/tags.mapper";

type SessionRow = typeof sessions.$inferSelect;

export class TagsService {
  constructor(private readonly db: AppDb) {}

  async listTags(): Promise<Tag[]> {
    const rows = await this.db.select().from(tags).orderBy(asc(tags.name)).all();
    return rows.map(toTag);
  }

  async getTagBySlug(slug: string): Promise<ApiTagWithSessions> {
    const tag = await this.db.select().from(tags).where(eq(tags.slug, slug)).get();

    if (!tag) {
      throw new HttpError(404, "Tag not found");
    }

    const sessionIds = await this.db
      .select({ sessionId: sessionTags.session_id })
      .from(sessionTags)
      .innerJoin(tags, eq(tags.id, sessionTags.tag_id))
      .innerJoin(sessions, eq(sessions.id, sessionTags.session_id))
      .where(eq(tags.slug, slug))
      .orderBy(desc(sessions.created_at), desc(sessions.id))
      .all();

    const sessionRows = await Promise.all(
      sessionIds.map(({ sessionId }) =>
        this.db.select().from(sessions).where(eq(sessions.id, sessionId)).get(),
      ),
    );

    const hydratedSessions = await this.hydrateSessions(
      sessionRows.filter((row): row is SessionRow => Boolean(row)),
    );

    return {
      tag: toTag(tag),
      sessions: hydratedSessions,
    };
  }

  private async hydrateSessions(rows: SessionRow[]): Promise<ApiSession[]> {
    if (rows.length === 0) {
      return [];
    }

    const sessionIds = rows.map((row) => row.id);
    const tagsBySessionId = await this.listTagsBySessionIds(sessionIds);

    return rows.map((row) => toApiSession(row, tagsBySessionId.get(row.id) ?? []));
  }

  private async listTagsBySessionIds(sessionIds: string[]): Promise<Map<string, Tag[]>> {
    const tagsBySessionId = new Map<string, Tag[]>();

    if (sessionIds.length === 0) {
      return tagsBySessionId;
    }

    const tagLookup = alias(tags, "tag_lookup");
    const rows = await this.db
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

    for (const row of rows) {
      const currentTags = tagsBySessionId.get(row.sessionId) ?? [];
      currentTags.push(toTag(row));
      tagsBySessionId.set(row.sessionId, currentTags);
    }

    return tagsBySessionId;
  }
}
