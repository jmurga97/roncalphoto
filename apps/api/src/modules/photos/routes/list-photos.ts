import { createRouter } from "@/app/create-app";
import { OK } from "@/config/status-codes";
import { jsonSuccess } from "@/shared/lib/http";
import { createApiRoute } from "@/shared/lib/openapi";

import { listPhotosQuerySchema, photosResponseSchema } from "../schemas/photos.schema";
import { getPhotosService } from "../services/photos.service";

const route = createApiRoute({
  method: "get",
  path: "/",
  tags: ["Photos"],
  request: {
    query: listPhotosQuerySchema,
  },
  responses: {
    [OK]: {
      description: "List photos",
      content: {
        "application/json": {
          schema: photosResponseSchema,
        },
      },
    },
  },
});

export default createRouter().openapi(route, async (c) => {
  c.req.valid("query");
  const service = getPhotosService(c.env.DB_RONCALPHOTO);
  const photos = await service.listPhotos();

  return jsonSuccess(c, photos, OK);
});
