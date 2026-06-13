import { createRouter } from "@/app/create-app";
import { requireSession } from "@/auth";
import {
  BAD_GATEWAY,
  CONFLICT,
  CREATED,
  PAYLOAD_TOO_LARGE,
  SERVICE_UNAVAILABLE,
  UNSUPPORTED_MEDIA_TYPE,
} from "@/config/status-codes";
import {
  createErrorResponse,
  jsonSuccess,
  protectedValidationErrorResponses,
} from "@/shared/lib/http";
import { createApiRoute } from "@/shared/lib/openapi";

import {
  createPhotoUploadBodySchema,
  createPhotoUploadResponseSchema,
  photoUploadHeadersSchema,
} from "../schemas/photo-uploads.schema";
import { getPhotoUploadsService } from "../services/photo-uploads.service";

const route = createApiRoute({
  method: "post",
  path: "/",
  middleware: requireSession,
  tags: ["Photo uploads"],
  request: {
    headers: photoUploadHeadersSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createPhotoUploadBodySchema,
        },
      },
    },
  },
  errorResponses: {
    ...protectedValidationErrorResponses,
    [CONFLICT]: createErrorResponse("Idempotency conflict"),
    [PAYLOAD_TOO_LARGE]: createErrorResponse("Image exceeds upload limit"),
    [UNSUPPORTED_MEDIA_TYPE]: createErrorResponse("Unsupported image type"),
    [BAD_GATEWAY]: createErrorResponse("Image service returned an invalid response"),
    [SERVICE_UNAVAILABLE]: createErrorResponse("Image service is unavailable"),
  },
  responses: {
    [CREATED]: {
      description: "Create a pending photo upload and return a signed R2 PUT URL",
      content: {
        "application/json": {
          schema: createPhotoUploadResponseSchema,
        },
      },
    },
  },
});

export default createRouter().openapi(route, async (context) => {
  const headers = context.req.valid("header");
  const input = context.req.valid("json");
  const service = getPhotoUploadsService(context.env.DB_RONCALPHOTO, context.env.IMAGE_WORKER);
  const result = await service.createUpload(headers["idempotency-key"], input);

  return jsonSuccess(context, result, CREATED);
});
