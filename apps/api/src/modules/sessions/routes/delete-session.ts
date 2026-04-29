import { createRouter } from "@/app/create-app";
import { apiKeyHeaderSchema } from "@/config/required-headers";
import { NOT_FOUND, OK } from "@/config/status-codes";
import type { AppRouteHandler } from "@/config/types";
import {
  badRequestResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  jsonSuccess,
  notFoundResponse,
  unauthorizedResponse,
} from "@/shared/lib/http";
import { createRoute } from "@hono/zod-openapi";
import { deleteSessionResponseSchema, sessionSlugParamsSchema } from "../schemas/sessions.schema";
import { getSessionsService } from "../services/sessions.service";

const route = createRoute({
  method: "delete",
  path: "/{slug}",
  tags: ["Sessions"],
  request: {
    headers: apiKeyHeaderSchema,
    params: sessionSlugParamsSchema,
  },
  responses: {
    [OK]: {
      description: "Delete a session",
      content: {
        "application/json": {
          schema: deleteSessionResponseSchema,
        },
      },
    },
    400: badRequestResponse,
    401: unauthorizedResponse,
    403: forbiddenResponse,
    [NOT_FOUND]: notFoundResponse,
    500: internalServerErrorResponse,
  },
});

const handler: AppRouteHandler<typeof route> = async (c) => {
  const { slug } = c.req.valid("param");
  const service = getSessionsService(c.env.DB_RONCALPHOTO);
  const result = await service.deleteSession(slug);

  return jsonSuccess(c, result, OK);
};

const router = createRouter().openapi(route, handler);

export default router;
