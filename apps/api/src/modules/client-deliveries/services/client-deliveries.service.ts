import { NOT_FOUND } from "@/config/status-codes";
import { HttpError } from "@/shared/errors";
import { toApiDelivery } from "@/shared/lib/api-mappers";
import { getOrCreateInstance } from "@/shared/lib/instance-cache";

import { getClientDeliveriesRepository } from "../repositories/client-deliveries.repository";

import type { ClientDeliveriesRepository } from "../repositories/client-deliveries.repository";
import type { ApiDelivery } from "@roncal/shared";

export class ClientDeliveriesService {
  constructor(private readonly repository: ClientDeliveriesRepository) {}

  async getDeliveryByToken(token: string): Promise<ApiDelivery> {
    const result = await this.repository.findByToken(token);

    if (!result) {
      throw new HttpError(NOT_FOUND, "Delivery not found");
    }

    return toApiDelivery(result.delivery, result.photos);
  }
}

const clientDeliveriesServiceInstances = new WeakMap<D1Database, ClientDeliveriesService>();

export function getClientDeliveriesService(client: D1Database): ClientDeliveriesService {
  return getOrCreateInstance(
    clientDeliveriesServiceInstances,
    client,
    () => new ClientDeliveriesService(getClientDeliveriesRepository(client)),
  );
}
