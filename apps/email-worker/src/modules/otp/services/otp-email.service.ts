import { OTP_EMAIL_SUBJECT } from "@/config/constants";
import type { Bindings, EmailSendResult } from "@/config/types";
import { renderOtpEmail } from "@roncal/email-templates";
import type { OtpRequestBody } from "../schemas/otp.schema";

export async function sendOtpEmail(
  env: Bindings,
  payload: OtpRequestBody,
): Promise<EmailSendResult> {
  const email = await renderOtpEmail({
    otp: payload.otp,
    expiresIn: payload.expiresIn,
  });

  return env.SEND_EMAIL.send({
    to: payload.to,
    from: {
      email: env.FROM_EMAIL,
      name: env.FROM_NAME,
    },
    subject: OTP_EMAIL_SUBJECT,
    html: email.html,
    text: email.text,
  });
}
