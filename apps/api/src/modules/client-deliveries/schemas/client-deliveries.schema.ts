import { z } from "@hono/zod-openapi";

import { apiDeliverySchema } from "@/shared/lib/contracts";
import { createSuccessResponseSchema } from "@/shared/lib/http";

export const deliveryTokenParamsSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1)
    .openapi({
      param: {
        name: "token",
        in: "path",
      },
      example: "k7Qm2v9bXp4r",
    }),
});

export const deliveryResponseSchema =
  createSuccessResponseSchema(apiDeliverySchema).openapi("DeliveryResponse");
