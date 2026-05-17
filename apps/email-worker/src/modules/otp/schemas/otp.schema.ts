import { z } from "@hono/zod-openapi";

import { createSuccessResponseSchema } from "@/shared/lib/http";

export const otpRequestBodySchema = z
  .object({
    to: z.string().trim().email(),
    otp: z.string().trim().min(1),
    expiresIn: z.string().trim().min(1),
  })
  .openapi("OtpRequestBody");

export const otpSendResponseDataSchema = z.object({
  messageId: z.string().min(1),
});

export const otpSendResponseSchema = createSuccessResponseSchema(
  otpSendResponseDataSchema,
).openapi("SendOtpResponse");
