import { requireSession } from "@/auth";
import { OK } from "@/config/status-codes";
import { jsonSuccess, protectedValidationNotFoundErrorResponses } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import {
  photoIdParamsSchema,
  photoResponseSchema,
  updatePhotoBodySchema,
} from "../schemas/photos.schema";
import { getPhotosService } from "../services/photos.service";

const route = createApiRoute({
  method: "put",
  path: "/{id}",
  middleware: requireSession,
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
  errorResponses: protectedValidationNotFoundErrorResponses,
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
