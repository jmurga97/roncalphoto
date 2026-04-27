import { createRouter } from "@/app/create-app";
import { apiKeyHeaderSchema } from "@/config/required-headers";
import { NOT_FOUND, OK } from "@/config/status-codes";
import type { AppRouteHandler } from "@/config/types";
import { createDb } from "@/db";
import {
  badRequestResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  jsonSuccess,
  notFoundResponse,
  unauthorizedResponse,
} from "@/shared/lib/http";
import { createRoute } from "@hono/zod-openapi";
import { tagDetailResponseSchema, tagSlugParamsSchema } from "../schemas/tags.schema";
import { TagsService } from "../services/tags.service";

const route = createRoute({
  method: "get",
  path: "/{slug}",
  tags: ["Tags"],
  request: {
    headers: apiKeyHeaderSchema,
    params: tagSlugParamsSchema,
  },
  responses: {
    [OK]: {
      description: "Get tag detail",
      content: {
        "application/json": {
          schema: tagDetailResponseSchema,
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
  const service = new TagsService(createDb(c.env.DB_RONCALPHOTO));
  const tagDetail = await service.getTagBySlug(slug);

  return jsonSuccess(c, tagDetail, OK);
};

const router = createRouter().openapi(route, handler);

export default router;
