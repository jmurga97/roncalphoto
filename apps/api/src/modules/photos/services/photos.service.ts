import type { AppDb } from "@/db";
import { getDb, photos } from "@/db";
import { HttpError } from "@/shared/errors";
import { generateId } from "@/shared/utils/id";
import type { ApiPhoto, PhotoMetadata } from "@roncal/shared";
import { asc, eq, sql } from "drizzle-orm";
import { normalizeMetadata, toApiPhoto } from "../utils/photos.mapper";

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
    const metadata = normalizeMetadata(input.metadata);
    const photo: ApiPhoto = {
      id: input.id ?? generateId(),
      sessionId: input.sessionId,
      url: input.url,
      miniature: input.miniature,
      alt: input.alt,
      about: input.about,
      sortOrder: input.sortOrder ?? 0,
      metadata,
    };

    await this.db.insert(photos).values({
      id: photo.id,
      session_id: photo.sessionId,
      url: photo.url,
      miniature: photo.miniature,
      alt: photo.alt,
      about: photo.about,
      sort_order: photo.sortOrder,
      iso: photo.metadata.iso,
      aperture: photo.metadata.aperture,
      shutter_speed: photo.metadata.shutterSpeed,
      lens: photo.metadata.lens,
      camera: photo.metadata.camera,
    });

    return photo;
  }

  async updatePhoto(id: string, input: UpdatePhotoInput): Promise<ApiPhoto> {
    const existing = await this.db.select().from(photos).where(eq(photos.id, id)).get();

    if (!existing) {
      throw new HttpError(404, "Photo not found");
    }

    const metadata = normalizeMetadata({
      iso: input.metadata?.iso ?? existing.iso ?? undefined,
      aperture: input.metadata?.aperture ?? existing.aperture ?? undefined,
      shutterSpeed: input.metadata?.shutterSpeed ?? existing.shutter_speed ?? undefined,
      lens: input.metadata?.lens ?? existing.lens ?? undefined,
      camera: input.metadata?.camera ?? existing.camera ?? undefined,
    });

    await this.db
      .update(photos)
      .set({
        session_id: input.sessionId ?? existing.session_id,
        url: input.url ?? existing.url,
        miniature: input.miniature ?? existing.miniature,
        alt: input.alt ?? existing.alt,
        about: input.about ?? existing.about,
        sort_order: input.sortOrder ?? existing.sort_order,
        iso: metadata.iso,
        aperture: metadata.aperture,
        shutter_speed: metadata.shutterSpeed,
        lens: metadata.lens,
        camera: metadata.camera,
      })
      .where(eq(photos.id, id));

    return {
      id,
      sessionId: input.sessionId ?? existing.session_id,
      url: input.url ?? existing.url,
      miniature: input.miniature ?? existing.miniature,
      alt: input.alt ?? existing.alt,
      about: input.about ?? existing.about,
      sortOrder: input.sortOrder ?? existing.sort_order,
      metadata,
    };
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
  const existingService = photosServiceInstances.get(client);

  if (existingService) {
    return existingService;
  }

  const service = new PhotosService(getDb(client));
  photosServiceInstances.set(client, service);

  return service;
}
