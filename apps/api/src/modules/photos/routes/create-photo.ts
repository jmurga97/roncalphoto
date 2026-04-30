import { CREATED } from "@/config/status-codes";
import { jsonSuccess } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import { createPhotoBodySchema, photoResponseSchema } from "../schemas/photos.schema";
import { getPhotosService } from "../services/photos.service";

const route = createApiRoute({
  method: "post",
  path: "/",
  tags: ["Photos"],
  request: {
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
  },
});

export default createOpenApiRouter(route, async (c) => {
  const input = c.req.valid("json");
  const service = getPhotosService(c.env.DB_RONCALPHOTO);
  const photo = await service.createPhoto(input);

  return jsonSuccess(c, photo, CREATED);
});
