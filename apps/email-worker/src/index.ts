import { renderOtpEmail } from "@roncal/email-templates";
import { Hono } from "hono";

const OTP_EMAIL_SUBJECT = "Tu codigo de acceso a RoncalPhoto";

type EmailAddress =
  | string
  | {
      email: string;
      name: string;
    };

interface EmailMessageBuilder {
  to: string | string[];
  from: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
}

interface EmailSendResult {
  messageId: string;
}

interface EmailBinding {
  send(message: EmailMessageBuilder): Promise<EmailSendResult>;
}

interface Bindings {
  SEND_EMAIL: EmailBinding;
  WORKER_API_KEY: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
}

interface OtpRequestBody {
  to: string;
  otp: string;
  expiresIn: string;
}

interface EmailServiceError extends Error {
  code?: string;
}

const app = new Hono<{ Bindings: Bindings }>({ strict: false });

function jsonResponse<T>(success: boolean, data: T, status: number): Response {
  return Response.json({ success, data }, { status });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseOtpRequestBody(value: unknown): OtpRequestBody | null {
  if (!isObject(value)) {
    return null;
  }

  const { to, otp, expiresIn } = value;

  if (!isNonEmptyString(to) || !isEmail(to)) {
    return null;
  }

  if (!isNonEmptyString(otp) || !isNonEmptyString(expiresIn)) {
    return null;
  }

  return {
    to: to.trim(),
    otp: otp.trim(),
    expiresIn: expiresIn.trim(),
  };
}

function toEmailServiceError(error: unknown): EmailServiceError {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Unknown email service error");
}

app.use("/send/*", async (c, next) => {
  const apiKey = c.req.header("X-Api-Key");

  if (!apiKey || apiKey !== c.env.WORKER_API_KEY) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        },
      },
      401,
    );
  }

  return next();
});

app.post("/send/otp", async (c) => {
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON",
        },
      },
      400,
    );
  }

  const payload = parseOtpRequestBody(body);

  if (!payload) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_BODY",
          message: "Expected { to, otp, expiresIn } with non-empty string values",
        },
      },
      400,
    );
  }

  try {
    const email = await renderOtpEmail({
      otp: payload.otp,
      expiresIn: payload.expiresIn,
    });
    const result = await c.env.SEND_EMAIL.send({
      to: payload.to,
      from: {
        email: c.env.FROM_EMAIL,
        name: c.env.FROM_NAME,
      },
      subject: OTP_EMAIL_SUBJECT,
      html: email.html,
      text: email.text,
    });

    return c.json(
      {
        success: true,
        data: {
          messageId: result.messageId,
        },
      },
      200,
    );
  } catch (error) {
    const emailError = toEmailServiceError(error);

    return c.json(
      {
        success: false,
        error: {
          code: emailError.code ?? "EMAIL_SEND_FAILED",
          message: emailError.message,
        },
      },
      502,
    );
  }
});

app.all("*", () =>
  jsonResponse(
    false,
    {
      code: "NOT_FOUND",
      message: "Not found",
    },
    404,
  ),
);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Bindings>;
