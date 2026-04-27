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
import {
  photoIdParamsSchema,
  photoResponseSchema,
  updatePhotoBodySchema,
} from "../schemas/photos.schema";
import { PhotosService } from "../services/photos.service";

const route = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Photos"],
  request: {
    headers: apiKeyHeaderSchema,
    params: photoIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updatePhotoBodySchema,
        },
      },
    },
  },
  responses: {
    [OK]: {
      description: "Update a photo",
      content: {
        "application/json": {
          schema: photoResponseSchema,
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
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const service = new PhotosService(createDb(c.env.DB_RONCALPHOTO));
  const photo = await service.updatePhoto(id, input);

  return jsonSuccess(c, photo, OK);
};

const router = createRouter().openapi(route, handler);

export default router;
