import { createRouter } from "@/app/create-app";
import { toEmailServiceError } from "@/shared/errors";
import { errorResponse, successResponse } from "@/shared/http/responses";
import { parseOtpRequestBody } from "../schemas/otp.schema";
import { sendOtpEmail } from "../services/otp-email.service";

const router = createRouter();

router.post("/otp", async (c) => {
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const payload = parseOtpRequestBody(body);

  if (!payload) {
    return errorResponse(
      "INVALID_BODY",
      "Expected { to, otp, expiresIn } with non-empty string values",
      400,
    );
  }

  try {
    const result = await sendOtpEmail(c.env, payload);

    return successResponse(
      {
        messageId: result.messageId,
      },
      200,
    );
  } catch (error) {
    const emailError = toEmailServiceError(error);

    return errorResponse("EMAIL_SEND_FAILED", emailError.message, 502);
  }
});

export default router;
