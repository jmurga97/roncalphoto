import { OK } from "@/config/status-codes";
import { jsonSuccess } from "@/shared/lib/http";
import { createOpenApiRouter, createReadOnlyProtectedRoute } from "@/shared/lib/openapi";
import { tagsResponseSchema } from "../schemas/tags.schema";
import { getTagsService } from "../services/tags.service";

const route = createReadOnlyProtectedRoute({
  method: "get",
  path: "/",
  tags: ["Tags"],
  responses: {
    [OK]: {
      description: "List tags",
      content: {
        "application/json": {
          schema: tagsResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const service = getTagsService(c.env.DB_RONCALPHOTO);
  const tags = await service.listTags();

  return jsonSuccess(c, tags, OK);
});
