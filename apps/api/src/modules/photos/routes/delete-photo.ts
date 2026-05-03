import { requireSession } from "@/auth";
import { OK } from "@/config/status-codes";
import { jsonSuccess, protectedValidationNotFoundErrorResponses } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import { deletePhotoResponseSchema, photoIdParamsSchema } from "../schemas/photos.schema";
import { getPhotosService } from "../services/photos.service";

const route = createApiRoute({
  method: "delete",
  path: "/{id}",
  middleware: requireSession,
  tags: ["Photos"],
  request: {
    params: photoIdParamsSchema,
  },
  errorResponses: protectedValidationNotFoundErrorResponses,
  responses: {
    [OK]: {
      description: "Delete a photo",
      content: {
        "application/json": {
          schema: deletePhotoResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const { id } = c.req.valid("param");
  const service = getPhotosService(c.env.DB_RONCALPHOTO);
  const result = await service.deletePhoto(id);

  return jsonSuccess(c, result, OK);
});
