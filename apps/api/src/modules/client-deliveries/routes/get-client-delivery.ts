import { createRouter } from "@/app/create-app";
import { OK } from "@/config/status-codes";
import { jsonSuccess, validationNotFoundErrorResponses } from "@/shared/lib/http";
import { createApiRoute } from "@/shared/lib/openapi";

import {
  deliveryResponseSchema,
  deliveryTokenParamsSchema,
} from "../schemas/client-deliveries.schema";
import { getClientDeliveriesService } from "../services/client-deliveries.service";

const route = createApiRoute({
  method: "get",
  path: "/{token}",
  tags: ["Client Deliveries"],
  request: {
    params: deliveryTokenParamsSchema,
  },
  errorResponses: validationNotFoundErrorResponses,
  responses: {
    [OK]: {
      description: "Get a client delivery by its token",
      content: {
        "application/json": {
          schema: deliveryResponseSchema,
        },
      },
    },
  },
});

export default createRouter().openapi(route, async (c) => {
  const { token } = c.req.valid("param");
  const service = getClientDeliveriesService(c.env.DB_RONCALPHOTO);
  const delivery = await service.getDeliveryByToken(token);

  return jsonSuccess(c, delivery, OK);
});
