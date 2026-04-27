import { createRouter } from "@/app/create-app";
import { apiKeyHeaderSchema } from "@/config/required-headers";
import { OK } from "@/config/status-codes";
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
import { listSessionsQuerySchema, sessionsResponseSchema } from "../schemas/sessions.schema";
import { SessionsService } from "../services/sessions.service";

function includesPhotos(include?: string): boolean {
  if (!include) {
    return false;
  }

  return include
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .includes("photos");
}

const route = createRoute({
  method: "get",
  path: "/",
  tags: ["Sessions"],
  request: {
    headers: apiKeyHeaderSchema,
    query: listSessionsQuerySchema,
  },
  responses: {
    [OK]: {
      description: "List sessions",
      content: {
        "application/json": {
          schema: sessionsResponseSchema,
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
  const query = c.req.valid("query");
  const service = new SessionsService(new SessionsRepository(createDb(c.env.DB_RONCALPHOTO)));
  const sessions = await service.listSessions({
    includePhotos: includesPhotos(query.include),
  });

  return jsonSuccess(c, sessions, OK);
};

const router = createRouter().openapi(route, handler);

export default router;
