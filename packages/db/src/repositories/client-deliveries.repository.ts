import { asc, eq } from "drizzle-orm";

import { toDelivery } from "../mappers";
import { clientDeliveries, deliveryPhotos } from "../schema";

import type { AppDb } from "../client";

export async function findByToken(db: AppDb, token: string) {
  const row = await db.query.clientDeliveries.findFirst({
    where: eq(clientDeliveries.token, token),
    with: { photos: { orderBy: [asc(deliveryPhotos.sortOrder), asc(deliveryPhotos.id)] } },
  });

  return row ? toDelivery(row) : null;
}
