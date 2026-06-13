import { createRouter } from "@/app/create-app";
import { requireSession } from "@/auth";
import { BAD_GATEWAY, CONFLICT, NOT_FOUND, OK, SERVICE_UNAVAILABLE } from "@/config/status-codes";
import {
  createErrorResponse,
  jsonSuccess,
  protectedValidationErrorResponses,
} from "@/shared/lib/http";
import { createApiRoute } from "@/shared/lib/openapi";

import {
  photoUploadIdParamsSchema,
  photoUploadStatusResponseSchema,
} from "../schemas/photo-uploads.schema";
import { getPhotoUploadsService } from "../services/photo-uploads.service";

const route = createApiRoute({
  method: "post",
  path: "/{uploadId}/retry",
  middleware: requireSession,
  tags: ["Photo uploads"],
  request: {
    params: photoUploadIdParamsSchema,
  },
  errorResponses: {
    ...protectedValidationErrorResponses,
    [NOT_FOUND]: createErrorResponse("Photo upload was not found"),
    [CONFLICT]: createErrorResponse("Photo upload cannot be retried"),
    [BAD_GATEWAY]: createErrorResponse("Image service returned an invalid response"),
    [SERVICE_UNAVAILABLE]: createErrorResponse("Image service is unavailable"),
  },
  responses: {
    [OK]: {
      description: "Retry a failed image upload",
      content: {
        "application/json": {
          schema: photoUploadStatusResponseSchema,
        },
      },
    },
  },
});

export default createRouter().openapi(route, async (context) => {
  const { uploadId } = context.req.valid("param");
  const service = getPhotoUploadsService(context.env.DB_RONCALPHOTO, context.env.IMAGE_WORKER);
  const result = await service.retryUpload(uploadId);

  return jsonSuccess(context, result, OK);
});
