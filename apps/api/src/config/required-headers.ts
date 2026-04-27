import { z } from "@hono/zod-openapi";

export const apiKeyHeaderName = "X-API-Key";

export const apiKeyHeaderSchema = z
  .object({
    [apiKeyHeaderName]: z
      .string()
      .trim()
      .min(1)
      .openapi({
        param: {
          name: apiKeyHeaderName,
          in: "header",
          required: true,
        },
        example: "local-dev-api-key",
      }),
  })
  .passthrough();
