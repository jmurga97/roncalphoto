import * as clientDeliveriesRepository from "@roncal/db/repositories/client-deliveries.repository";

import { orNotFound } from "../../shared/errors";

import type { AppDb } from "@roncal/db/client";

export async function getDelivery(db: AppDb, token: string) {
  return orNotFound(await clientDeliveriesRepository.findByToken(db, token), "Delivery");
}
