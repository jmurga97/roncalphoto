import { createRouter } from "@/app/create-app";
import { apiKeyHeaderSchema } from "@/config/required-headers";
import { CREATED } from "@/config/status-codes";
import type { AppRouteHandler } from "@/config/types";
import {
  badRequestResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  jsonSuccess,
  unauthorizedResponse,
} from "@/shared/lib/http";
import { createRoute } from "@hono/zod-openapi";
import { createPhotoBodySchema, photoResponseSchema } from "../schemas/photos.schema";
import { getPhotosService } from "../services/photos.service";

const route = createRoute({
  method: "post",
  path: "/",
  tags: ["Photos"],
  request: {
    headers: apiKeyHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createPhotoBodySchema,
        },
      },
    },
  },
  responses: {
    [CREATED]: {
      description: "Create a photo",
      content: {
        "application/json": {
          schema: photoResponseSchema,
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
  const service = getPhotosService(c.env.DB_RONCALPHOTO);
  const photo = await service.createPhoto(input);

  return jsonSuccess(c, photo, CREATED);
};

const router = createRouter().openapi(route, handler);

export default router;
