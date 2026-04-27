import { createRouter } from "@/app/create-app";
import { apiKeyHeaderSchema } from "@/config/required-headers";
import { OK } from "@/config/status-codes";
import type { AppRouteHandler } from "@/config/types";
import { createDb } from "@/db";
import {
  badRequestResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  jsonPaginated,
  unauthorizedResponse,
} from "@/shared/lib/http";
import { createRoute } from "@hono/zod-openapi";
import { listPhotosQuerySchema, photosPaginatedResponseSchema } from "../schemas/photos.schema";
import { PhotosService } from "../services/photos.service";

const route = createRoute({
  method: "get",
  path: "/",
  tags: ["Photos"],
  request: {
    headers: apiKeyHeaderSchema,
    query: listPhotosQuerySchema,
  },
  responses: {
    [OK]: {
      description: "List photos",
      content: {
        "application/json": {
          schema: photosPaginatedResponseSchema,
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
  const service = new PhotosService(createDb(c.env.DB_RONCALPHOTO));
  const result = await service.listPhotos(query);

  return jsonPaginated(c, result.data, result.pagination);
};

const router = createRouter().openapi(route, handler);

export default router;
