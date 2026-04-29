import type { AppDb, AppTransaction, DbExecutor } from "@/db";
import { getDb, photos, sessionTags, sessions, tags } from "@/db";
import { HttpError } from "@/shared/errors";
import type { ApiPhoto, Tag } from "@roncal/shared";
import { and, asc, desc, eq, inArray, like, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { toApiPhoto, toTag } from "../utils/sessions.mapper";

function uniqueTagIds(tagIds: string[]): string[] {
  return Array.from(new Set(tagIds));
}

function getExecutor(db: AppDb, executor?: DbExecutor): DbExecutor {
  return executor ?? db;
}

export class SessionsRepository {
  constructor(private readonly db: AppDb) {}

  async listSessions() {
    return this.db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.created_at), desc(sessions.id))
      .all();
  }

  async findSessionBySlug(slug: string) {
    return this.db.select().from(sessions).where(eq(sessions.slug, slug)).get();
  }

  async findSessionIdBySlug(slug: string) {
    return this.db.select({ id: sessions.id }).from(sessions).where(eq(sessions.slug, slug)).get();
  }

  async createSession(
    values: {
      id: string;
      slug: string;
      title: string;
      description: string;
    },
    executor?: DbExecutor,
  ) {
    const activeExecutor = getExecutor(this.db, executor);
    await activeExecutor.insert(sessions).values(values);
  }

  async updateSession(
    sessionId: string,
    values: {
      slug: string;
      title: string;
      description: string;
    },
    executor?: DbExecutor,
  ) {
    const activeExecutor = getExecutor(this.db, executor);
    await activeExecutor.update(sessions).set(values).where(eq(sessions.id, sessionId));
  }

  async deleteSession(sessionId: string) {
    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async replaceSessionTags(sessionId: string, tagIds: string[], executor?: DbExecutor) {
    const activeExecutor = getExecutor(this.db, executor);

    await activeExecutor.delete(sessionTags).where(eq(sessionTags.session_id, sessionId));

    if (tagIds.length === 0) {
      return;
    }

    await activeExecutor.insert(sessionTags).values(
      tagIds.map((tagId) => ({
        session_id: sessionId,
        tag_id: tagId,
      })),
    );
  }

  async listValidTagIds(tagIds: string[]) {
    const normalizedTagIds = uniqueTagIds(tagIds);

    if (normalizedTagIds.length === 0) {
      throw new HttpError(400, "tagIds is required and must contain at least one tag");
    }

    const rows = await this.db
      .select({ id: tags.id })
      .from(tags)
      .where(inArray(tags.id, normalizedTagIds))
      .all();

    if (rows.length !== normalizedTagIds.length) {
      throw new HttpError(400, "One or more tags were not found");
    }

    return rows.map((row) => row.id);
  }

  async listMatchingSlugs(baseSlug: string, excludeSessionId?: string) {
    const prefix = `${baseSlug}-%`;
    const slugFilter = or(eq(sessions.slug, baseSlug), like(sessions.slug, prefix));
    const whereClause = excludeSessionId
      ? and(slugFilter, ne(sessions.id, excludeSessionId))
      : slugFilter;

    const rows = await this.db
      .select({ slug: sessions.slug })
      .from(sessions)
      .where(whereClause)
      .all();

    return rows.map((row) => row.slug);
  }

  async listTagsBySessionIds(sessionIds: string[]): Promise<Map<string, Tag[]>> {
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

  async listPhotosBySessionIds(sessionIds: string[]): Promise<Map<string, ApiPhoto[]>> {
    const photosBySessionId = new Map<string, ApiPhoto[]>();

    if (sessionIds.length === 0) {
      return photosBySessionId;
    }

    const rows = await this.db
      .select()
      .from(photos)
      .where(inArray(photos.session_id, sessionIds))
      .orderBy(asc(photos.session_id), asc(photos.sort_order), asc(photos.id))
      .all();

    for (const row of rows) {
      const currentPhotos = photosBySessionId.get(row.session_id) ?? [];
      currentPhotos.push(toApiPhoto(row));
      photosBySessionId.set(row.session_id, currentPhotos);
    }

    return photosBySessionId;
  }

  async transaction<T>(callback: (transaction: AppTransaction) => Promise<T>) {
    return this.db.transaction(callback);
  }
}

const sessionsRepositoryInstances = new WeakMap<D1Database, SessionsRepository>();

export function getSessionsRepository(client: D1Database): SessionsRepository {
  const existingRepository = sessionsRepositoryInstances.get(client);

  if (existingRepository) {
    return existingRepository;
  }

  const repository = new SessionsRepository(getDb(client));
  sessionsRepositoryInstances.set(client, repository);

  return repository;
}
