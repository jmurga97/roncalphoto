import { apiDeliveryToDelivery } from "@roncal/shared";

import { apiClient } from "@lib/api/client";

import type { ApiDelivery, Delivery } from "@roncal/shared";

export const deliveriesService = {
  async getDeliveryByToken(token: string): Promise<Delivery> {
    const delivery = await apiClient.get<ApiDelivery>(
      `/api/client-deliveries/${encodeURIComponent(token)}`,
    );
    return apiDeliveryToDelivery(delivery);
  },
};
