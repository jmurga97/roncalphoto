import { HttpError } from "@/shared/errors";
import { generateId } from "@/shared/utils/id";
import { pickNextAvailableSlug, slugify } from "@/shared/utils/slug";
import type { ApiSession } from "@roncal/shared";
import {
  getSessionsRepository,
  type SessionsRepository,
} from "../repositories/sessions.repository";
import { toApiSession } from "../utils/sessions.mapper";

interface HydrateOptions {
  includePhotos?: boolean;
}

interface CreateSessionInput {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  tagIds: string[];
}

interface UpdateSessionInput {
  slug?: string;
  title?: string;
  description?: string;
  tagIds?: string[];
}

export class SessionsService {
  constructor(private readonly repository: SessionsRepository) {}

  async listSessions(options: HydrateOptions = {}): Promise<ApiSession[]> {
    const rows = await this.repository.listSessions();
    return this.hydrateSessions(rows, options);
  }

  async getSessionBySlug(slug: string, options: HydrateOptions = {}): Promise<ApiSession> {
    const row = await this.repository.findSessionBySlug(slug);

    if (!row) {
      throw new HttpError(404, "Session not found");
    }

    const [session] = await this.hydrateSessions([row], options);

    if (!session) {
      throw new HttpError(404, "Session not found");
    }

    return session;
  }

  async createSession(input: CreateSessionInput): Promise<ApiSession> {
    const validTagIds = await this.repository.listValidTagIds(input.tagIds);
    const id = input.id ?? generateId();
    const slug = await this.ensureUniqueSessionSlug(input.slug ?? input.title);

    await this.repository.transaction(async (transaction) => {
      await this.repository.createSession(
        {
          id,
          slug,
          title: input.title,
          description: input.description,
        },
        transaction,
      );

      await this.repository.replaceSessionTags(id, validTagIds, transaction);
    });

    return this.getSessionBySlug(slug);
  }

  async updateSession(slug: string, input: UpdateSessionInput): Promise<ApiSession> {
    const existing = await this.repository.findSessionBySlug(slug);

    if (!existing) {
      throw new HttpError(404, "Session not found");
    }

    const nextSlug =
      input.slug !== undefined
        ? await this.ensureUniqueSessionSlug(input.slug, existing.id)
        : existing.slug;
    const nextTagIds = input.tagIds
      ? await this.repository.listValidTagIds(input.tagIds)
      : undefined;

    await this.repository.transaction(async (transaction) => {
      await this.repository.updateSession(
        existing.id,
        {
          slug: nextSlug,
          title: input.title ?? existing.title,
          description: input.description ?? existing.description,
        },
        transaction,
      );

      if (nextTagIds) {
        await this.repository.replaceSessionTags(existing.id, nextTagIds, transaction);
      }
    });

    return this.getSessionBySlug(nextSlug);
  }

  async deleteSession(slug: string) {
    const existing = await this.repository.findSessionIdBySlug(slug);

    if (!existing) {
      throw new HttpError(404, "Session not found");
    }

    await this.repository.deleteSession(existing.id);

    return {
      deleted: true as const,
    };
  }

  private async hydrateSessions(
    rows: Awaited<ReturnType<SessionsRepository["listSessions"]>>,
    options: HydrateOptions = {},
  ): Promise<ApiSession[]> {
    if (rows.length === 0) {
      return [];
    }

    const includePhotos = options.includePhotos ?? false;
    const sessionIds = rows.map((row) => row.id);
    const [tagsBySessionId, photosBySessionId] = await Promise.all([
      this.repository.listTagsBySessionIds(sessionIds),
      includePhotos
        ? this.repository.listPhotosBySessionIds(sessionIds)
        : Promise.resolve(new Map<string, never[]>()),
    ]);

    return rows.map((row) =>
      toApiSession(
        row,
        tagsBySessionId.get(row.id) ?? [],
        includePhotos ? (photosBySessionId.get(row.id) ?? []) : undefined,
      ),
    );
  }

  private async ensureUniqueSessionSlug(rawSlug: string, excludeSessionId?: string) {
    const baseSlug = slugify(rawSlug);

    if (!baseSlug) {
      throw new HttpError(400, "slug must contain letters or numbers");
    }

    const existingSlugs = await this.repository.listMatchingSlugs(baseSlug, excludeSessionId);
    return pickNextAvailableSlug(baseSlug, existingSlugs);
  }
}

const sessionsServiceInstances = new WeakMap<D1Database, SessionsService>();

export function getSessionsService(client: D1Database): SessionsService {
  const existingService = sessionsServiceInstances.get(client);

  if (existingService) {
    return existingService;
  }

  const service = new SessionsService(getSessionsRepository(client));
  sessionsServiceInstances.set(client, service);

  return service;
}
