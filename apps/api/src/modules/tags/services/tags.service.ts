import type { AppDb } from "@/db";
import { getDb, sessionTags, sessions, tags } from "@/db";
import { HttpError } from "@/shared/errors";
import { toApiSession, toTag, type SessionRecord } from "@/shared/lib/api-mappers";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";
import { listTagsBySessionIds } from "@/shared/lib/session-relations";
import type { ApiSession, ApiTagWithSessions, Tag } from "@roncal/shared";
import { asc, desc, eq } from "drizzle-orm";

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

    const sessionRows = await this.db
      .select({
        id: sessions.id,
        slug: sessions.slug,
        title: sessions.title,
        description: sessions.description,
        created_at: sessions.created_at,
      })
      .from(sessions)
      .innerJoin(sessionTags, eq(sessionTags.session_id, sessions.id))
      .where(eq(sessionTags.tag_id, tag.id))
      .orderBy(desc(sessions.created_at), desc(sessions.id))
      .all();

    return {
      tag: toTag(tag),
      sessions: await this.hydrateSessions(sessionRows),
    };
  }

  private async hydrateSessions(rows: SessionRecord[]): Promise<ApiSession[]> {
    if (rows.length === 0) {
      return [];
    }

    const sessionIds = rows.map((row) => row.id);
    const tagsBySessionId = await listTagsBySessionIds(this.db, sessionIds);

    return rows.map((row) => toApiSession(row, tagsBySessionId.get(row.id) ?? []));
  }
}

const tagsServiceInstances = new WeakMap<D1Database, TagsService>();

export function getTagsService(client: D1Database): TagsService {
  return getOrCreateInstance(tagsServiceInstances, client, () => new TagsService(getDb(client)));
}
