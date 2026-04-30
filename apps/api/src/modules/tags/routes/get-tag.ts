import { OK } from "@/config/status-codes";
import { jsonSuccess, validationNotFoundErrorResponses } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import { tagDetailResponseSchema, tagSlugParamsSchema } from "../schemas/tags.schema";
import { getTagsService } from "../services/tags.service";

const route = createApiRoute({
  method: "get",
  path: "/{slug}",
  tags: ["Tags"],
  request: {
    params: tagSlugParamsSchema,
  },
  errorResponses: validationNotFoundErrorResponses,
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
