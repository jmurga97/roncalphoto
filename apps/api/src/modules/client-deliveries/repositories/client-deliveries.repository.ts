import { asc, eq } from "drizzle-orm";

import { clientDeliveries, deliveryPhotos, getDb } from "@/db";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";

import type { AppDb } from "@/db";
import type { DeliveryPhotoRecord, DeliveryRecord } from "@/shared/lib/api-mappers";

export interface DeliveryWithPhotos {
  delivery: DeliveryRecord;
  photos: DeliveryPhotoRecord[];
}

export class ClientDeliveriesRepository {
  constructor(private readonly db: AppDb) {}

  async findByToken(token: string): Promise<DeliveryWithPhotos | null> {
    const delivery = await this.db
      .select()
      .from(clientDeliveries)
      .where(eq(clientDeliveries.token, token))
      .get();

    if (!delivery) {
      return null;
    }

    const photos = await this.db
      .select()
      .from(deliveryPhotos)
      .where(eq(deliveryPhotos.delivery_id, delivery.id))
      .orderBy(asc(deliveryPhotos.sort_order), asc(deliveryPhotos.id))
      .all();

    return { delivery, photos };
  }
}

const clientDeliveriesRepositoryInstances = new WeakMap<D1Database, ClientDeliveriesRepository>();

export function getClientDeliveriesRepository(client: D1Database): ClientDeliveriesRepository {
  return getOrCreateInstance(
    clientDeliveriesRepositoryInstances,
    client,
    () => new ClientDeliveriesRepository(getDb(client)),
  );
}
