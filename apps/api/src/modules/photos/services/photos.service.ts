import { asc, eq } from "drizzle-orm";

import { getDb, photos } from "@/db";
import { createPhotoEntity } from "@/modules/photos/utils/create-photo-entity";
import { mergePhotoEntity } from "@/modules/photos/utils/merge-photo-entity";
import { HttpError } from "@/shared/errors";
import { toApiPhoto, toPhotoRecord, toPhotoUpdateRecord } from "@/shared/lib/api-mappers";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";

import type { AppDb } from "@/db";
import type { CreatePhotoInput, UpdatePhotoInput } from "@/modules/photos/types";
import type { ApiPhoto } from "@roncal/shared";

export class PhotosService {
  constructor(private readonly db: AppDb) {}

  async listPhotos(): Promise<ApiPhoto[]> {
    const rows = await this.db
      .select()
      .from(photos)
      .orderBy(asc(photos.session_id), asc(photos.sort_order), asc(photos.id))
      .all();

    return rows.map(toApiPhoto);
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
