import { queryOptions } from "@tanstack/react-query";

import { deliveriesService } from "./deliveries";

export function deliveryDetailQueryOptions(token: string) {
  return queryOptions({
    queryKey: ["delivery", token],
    queryFn: () => deliveriesService.getDeliveryByToken(token),
    staleTime: 60 * 1000,
  });
}
