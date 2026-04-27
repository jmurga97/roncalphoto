import { createRouter } from "@/app/create-app";
import { apiKeyHeaderSchema } from "@/config/required-headers";
import { OK } from "@/config/status-codes";
import type { AppRouteHandler } from "@/config/types";
import { createDb } from "@/db";
import {
  forbiddenResponse,
  internalServerErrorResponse,
  jsonSuccess,
  unauthorizedResponse,
} from "@/shared/lib/http";
import { createRoute } from "@hono/zod-openapi";
import { tagsResponseSchema } from "../schemas/tags.schema";
import { TagsService } from "../services/tags.service";

const route = createRoute({
  method: "get",
  path: "/",
  tags: ["Tags"],
  request: {
    headers: apiKeyHeaderSchema,
  },
  responses: {
    [OK]: {
      description: "List tags",
      content: {
        "application/json": {
          schema: tagsResponseSchema,
        },
      },
    },
    401: unauthorizedResponse,
    403: forbiddenResponse,
    500: internalServerErrorResponse,
  },
});

const handler: AppRouteHandler<typeof route> = async (c) => {
  const service = new TagsService(createDb(c.env.DB_RONCALPHOTO));
  const tags = await service.listTags();

  return jsonSuccess(c, tags, OK);
};

const router = createRouter().openapi(route, handler);

export default router;
