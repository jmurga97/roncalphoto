import { OK } from "@/config/status-codes";
import { jsonSuccess, validationNotFoundErrorResponses } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import { photoIdParamsSchema, photoResponseSchema } from "../schemas/photos.schema";
import { getPhotosService } from "../services/photos.service";

const route = createApiRoute({
  method: "get",
  path: "/{id}",
  tags: ["Photos"],
  request: {
    params: photoIdParamsSchema,
  },
  errorResponses: validationNotFoundErrorResponses,
  responses: {
    [OK]: {
      description: "Get a photo by id",
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
  const service = getPhotosService(c.env.DB_RONCALPHOTO);
  const photo = await service.getPhotoById(id);

  return jsonSuccess(c, photo, OK);
});
