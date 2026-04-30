import { OK } from "@/config/status-codes";
import { jsonPaginated } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import { listPhotosQuerySchema, photosPaginatedResponseSchema } from "../schemas/photos.schema";
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
          schema: photosPaginatedResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const query = c.req.valid("query");
  const service = getPhotosService(c.env.DB_RONCALPHOTO);
  const result = await service.listPhotos(query);

  return jsonPaginated(c, result.data, result.pagination);
});
