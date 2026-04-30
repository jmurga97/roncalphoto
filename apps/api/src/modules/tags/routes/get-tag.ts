import { OK } from "@/config/status-codes";
import {
  jsonSuccess,
  protectedRouteNotFoundErrorResponses,
} from "@/shared/lib/http";
import { createOpenApiRouter, createProtectedRoute } from "@/shared/lib/openapi";
import { tagDetailResponseSchema, tagSlugParamsSchema } from "../schemas/tags.schema";
import { getTagsService } from "../services/tags.service";

const route = createProtectedRoute({
  method: "get",
  path: "/{slug}",
  tags: ["Tags"],
  request: {
    params: tagSlugParamsSchema,
  },
  errorResponses: protectedRouteNotFoundErrorResponses,
  responses: {
    [OK]: {
      description: "Get tag detail",
      content: {
        "application/json": {
          schema: tagDetailResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const { slug } = c.req.valid("param");
  const service = getTagsService(c.env.DB_RONCALPHOTO);
  const tagDetail = await service.getTagBySlug(slug);

  return jsonSuccess(c, tagDetail, OK);
});
