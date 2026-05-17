import { createRouter } from "@/app/create-app";
import { BAD_GATEWAY, BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "@/shared/config/status-codes";
import { toEmailServiceError } from "@/shared/errors/email-service-error";
import { errorResponse } from "@/shared/http/responses";
import { createErrorResponse, internalServerErrorResponse, jsonSuccess } from "@/shared/lib/http";
import { createApiRoute } from "@/shared/lib/openapi";

import { otpRequestBodySchema, otpSendResponseSchema } from "../schemas/otp.schema";
import { sendOtpEmail } from "../services/otp-email.service";

const route = createApiRoute({
  method: "post",
  path: "/otp",
  tags: ["OTP"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: otpRequestBodySchema,
        },
      },
    },
  },
  errorResponses: {
    [BAD_REQUEST]: createErrorResponse("Invalid OTP payload"),
    [INTERNAL_SERVER_ERROR]: internalServerErrorResponse,
    [BAD_GATEWAY]: createErrorResponse("Failed to send OTP email"),
  },
  responses: {
    [OK]: {
      description: "Send OTP email",
      content: {
        "application/json": {
          schema: otpSendResponseSchema,
        },
      },
    },
  },
});

export default createRouter().openapi(route, async (c) => {
  const payload = c.req.valid("json");

  try {
    const result = await sendOtpEmail(c.env, payload);

    return jsonSuccess(
      c,
      {
        messageId: result.messageId,
      },
      OK,
    );
  } catch (error) {
    const emailError = toEmailServiceError(error);

    return errorResponse("EMAIL_SEND_FAILED", emailError.message, BAD_GATEWAY);
  }
});
