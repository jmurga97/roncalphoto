import { OK } from "@/config/status-codes";
import {
  jsonSuccess,
  protectedRouteNotFoundErrorResponses,
} from "@/shared/lib/http";
import { createOpenApiRouter, createProtectedRoute } from "@/shared/lib/openapi";
import {
  photoIdParamsSchema,
  photoResponseSchema,
  updatePhotoBodySchema,
} from "../schemas/photos.schema";
import { getPhotosService } from "../services/photos.service";

const route = createProtectedRoute({
  method: "put",
  path: "/{id}",
  tags: ["Photos"],
  request: {
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
  errorResponses: protectedRouteNotFoundErrorResponses,
  responses: {
    [OK]: {
      description: "Update a photo",
      content: {
        "application/json": {
          schema: photoResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const service = getPhotosService(c.env.DB_RONCALPHOTO);
  const photo = await service.updatePhoto(id, input);

  return jsonSuccess(c, photo, OK);
});
