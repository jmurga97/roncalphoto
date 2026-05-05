export interface OtpRequestBody {
  to: string;
  otp: string;
  expiresIn: string;
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

export function parseOtpRequestBody(value: unknown): OtpRequestBody | null {
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
