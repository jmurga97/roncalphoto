import { createRouter } from "@/app/create-app";
import { apiKeyHeaderSchema } from "@/config/required-headers";
import { CREATED } from "@/config/status-codes";
import type { AppRouteHandler } from "@/config/types";
import { createDb } from "@/db";
import {
  badRequestResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  jsonSuccess,
  unauthorizedResponse,
} from "@/shared/lib/http";
import { createRoute } from "@hono/zod-openapi";
import { SessionsRepository } from "../repositories/sessions.repository";
import { createSessionBodySchema, sessionResponseSchema } from "../schemas/sessions.schema";
import { SessionsService } from "../services/sessions.service";

const route = createRoute({
  method: "post",
  path: "/",
  tags: ["Sessions"],
  request: {
    headers: apiKeyHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createSessionBodySchema,
        },
      },
    },
  },
  responses: {
    [CREATED]: {
      description: "Create a session",
      content: {
        "application/json": {
          schema: sessionResponseSchema,
        },
      },
    },
    400: badRequestResponse,
    401: unauthorizedResponse,
    403: forbiddenResponse,
    500: internalServerErrorResponse,
  },
});

const handler: AppRouteHandler<typeof route> = async (c) => {
  const input = c.req.valid("json");
  const service = new SessionsService(new SessionsRepository(createDb(c.env.DB_RONCALPHOTO)));
  const session = await service.createSession(input);

  return jsonSuccess(c, session, CREATED);
};

const router = createRouter().openapi(route, handler);

export default router;
