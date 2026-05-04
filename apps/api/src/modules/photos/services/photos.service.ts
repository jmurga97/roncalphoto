import type { AppDb } from "@/db";
import { getDb, photos } from "@/db";
import { HttpError } from "@/shared/errors";
import {
  type PhotoRecord,
  toApiPhoto,
  toPhotoRecord,
  toPhotoUpdateRecord,
} from "@/shared/lib/api-mappers";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";
import { generateId } from "@/shared/utils/id";
import { type ApiPhoto, type PhotoMetadata, normalizePhotoMetadata } from "@roncal/shared";
import { asc, eq, sql } from "drizzle-orm";

interface ListPhotosOptions {
  page: number;
  pageSize: number;
}

interface CreatePhotoInput {
  id?: string;
  sessionId: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sortOrder?: number;
  metadata?: Partial<PhotoMetadata>;
}

interface UpdatePhotoInput {
  sessionId?: string;
  url?: string;
  miniature?: string;
  alt?: string;
  about?: string;
  sortOrder?: number;
  metadata?: Partial<PhotoMetadata>;
}

function createPhotoEntity(input: CreatePhotoInput): ApiPhoto {
  return {
    id: input.id ?? generateId(),
    sessionId: input.sessionId,
    url: input.url,
    miniature: input.miniature,
    alt: input.alt,
    about: input.about,
    sortOrder: input.sortOrder ?? 0,
    metadata: normalizePhotoMetadata(input.metadata),
  };
}

function mergePhotoEntity(existing: PhotoRecord, input: UpdatePhotoInput): ApiPhoto {
  const currentPhoto = toApiPhoto(existing);

  return {
    ...currentPhoto,
    sessionId: input.sessionId ?? currentPhoto.sessionId,
    url: input.url ?? currentPhoto.url,
    miniature: input.miniature ?? currentPhoto.miniature,
    alt: input.alt ?? currentPhoto.alt,
    about: input.about ?? currentPhoto.about,
    sortOrder: input.sortOrder ?? currentPhoto.sortOrder,
    metadata: normalizePhotoMetadata({
      ...currentPhoto.metadata,
      ...input.metadata,
    }),
  };
}

export class PhotosService {
  constructor(private readonly db: AppDb) {}

  async listPhotos({ page, pageSize }: ListPhotosOptions) {
    const offset = (page - 1) * pageSize;
    const [countRow, rows] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(photos).get(),
      this.db
        .select()
        .from(photos)
        .orderBy(asc(photos.session_id), asc(photos.sort_order), asc(photos.id))
        .limit(pageSize)
        .offset(offset)
        .all(),
    ]);

    const total = Number(countRow?.count ?? 0);

    return {
      data: rows.map(toApiPhoto),
      pagination: {
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
    };
  }

  async getPhotoById(id: string): Promise<ApiPhoto> {
    const row = await this.db.select().from(photos).where(eq(photos.id, id)).get();

    if (!row) {
      throw new HttpError(404, "Photo not found");
    }

    return toApiPhoto(row);
  }

  async createPhoto(input: CreatePhotoInput): Promise<ApiPhoto> {
    const photo = createPhotoEntity(input);

    await this.db.insert(photos).values(toPhotoRecord(photo));

    return photo;
  }

  async updatePhoto(id: string, input: UpdatePhotoInput): Promise<ApiPhoto> {
    const existing = await this.db.select().from(photos).where(eq(photos.id, id)).get();

    if (!existing) {
      throw new HttpError(404, "Photo not found");
    }

    const photo = mergePhotoEntity(existing, input);

    await this.db.update(photos).set(toPhotoUpdateRecord(photo)).where(eq(photos.id, id));

    return photo;
  }

  async deletePhoto(id: string) {
    const existing = await this.db
      .select({ id: photos.id })
      .from(photos)
      .where(eq(photos.id, id))
      .get();

    if (!existing) {
      throw new HttpError(404, "Photo not found");
    }

    await this.db.delete(photos).where(eq(photos.id, id));

    return {
      deleted: true as const,
    };
  }
}

const photosServiceInstances = new WeakMap<D1Database, PhotosService>();

export function getPhotosService(client: D1Database): PhotosService {
  return getOrCreateInstance(
    photosServiceInstances,
    client,
    () => new PhotosService(getDb(client)),
  );
}
