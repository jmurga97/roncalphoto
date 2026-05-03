import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import type { CSSProperties } from "react";

export type OtpEmailData = {
  otp: string;
  expiresIn: string;
};

const palette = {
  black: "#000000",
  surface: "#111111",
  surfaceRaised: "#1a1a1a",
  border: "#222222",
  borderVisible: "#333333",
  textDisabled: "#666666",
  textSecondary: "#999999",
  textPrimary: "#e8e8e8",
  textDisplay: "#ffffff",
  accent: "#d71921",
} as const;

const styles = {
  body: {
    margin: "0",
    backgroundColor: palette.black,
    color: palette.textPrimary,
    fontFamily: "Space Grotesk, DM Sans, Avenir Next, Segoe UI, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "560px",
    margin: "0 auto",
    padding: "48px 24px 32px",
  },
  card: {
    border: `1px solid ${palette.borderVisible}`,
    borderRadius: "16px",
    backgroundColor: palette.surface,
    padding: "24px",
  },
  eyebrow: {
    margin: "0 0 48px",
    color: palette.textSecondary,
    fontFamily: "Space Mono, JetBrains Mono, SFMono-Regular, Consolas, monospace",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "0.08em",
    lineHeight: "14px",
    textTransform: "uppercase",
  },
  heading: {
    margin: "0 0 8px",
    color: palette.textDisplay,
    fontFamily: "Space Grotesk, DM Sans, Avenir Next, Segoe UI, sans-serif",
    fontSize: "24px",
    fontWeight: 500,
    letterSpacing: "0",
    lineHeight: "29px",
  },
  copy: {
    margin: "0 0 32px",
    color: palette.textSecondary,
    fontSize: "14px",
    letterSpacing: "0",
    lineHeight: "21px",
  },
  otpBox: {
    margin: "0 0 24px",
    border: `1px solid ${palette.borderVisible}`,
    borderRadius: "8px",
    backgroundColor: palette.surfaceRaised,
    padding: "20px 16px",
    textAlign: "center",
  },
  otpLabel: {
    margin: "0 0 12px",
    color: palette.textSecondary,
    fontFamily: "Space Mono, JetBrains Mono, SFMono-Regular, Consolas, monospace",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "0.08em",
    lineHeight: "14px",
    textTransform: "uppercase",
  },
  otp: {
    margin: "0",
    color: palette.textDisplay,
    fontFamily: "Space Mono, JetBrains Mono, SFMono-Regular, Consolas, monospace",
    fontSize: "44px",
    fontWeight: 700,
    letterSpacing: "0.16em",
    lineHeight: "48px",
  },
  hr: {
    margin: "24px 0",
    borderColor: palette.border,
  },
  row: {
    margin: "0",
    borderBottom: `1px solid ${palette.border}`,
    padding: "0 0 12px",
  },
  rowLabel: {
    margin: "0 0 4px",
    color: palette.textSecondary,
    fontFamily: "Space Mono, JetBrains Mono, SFMono-Regular, Consolas, monospace",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "0.08em",
    lineHeight: "14px",
    textTransform: "uppercase",
  },
  rowValue: {
    margin: "0",
    color: palette.accent,
    fontFamily: "Space Mono, JetBrains Mono, SFMono-Regular, Consolas, monospace",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    lineHeight: "18px",
  },
  note: {
    margin: "0",
    color: palette.textSecondary,
    fontSize: "13px",
    lineHeight: "20px",
  },
  footer: {
    margin: "20px 0 0",
    color: palette.textDisabled,
    fontFamily: "Space Mono, JetBrains Mono, SFMono-Regular, Consolas, monospace",
    fontSize: "11px",
    letterSpacing: "0.08em",
    lineHeight: "16px",
    textAlign: "center",
    textTransform: "uppercase",
  },
} satisfies Record<string, CSSProperties>;

export function OtpEmail({ otp, expiresIn }: OtpEmailData) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu codigo de acceso a RoncalPhoto es {otp}.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            <Text style={styles.eyebrow}>RoncalPhoto Admin / Auth</Text>
            <Heading style={styles.heading}>Codigo de acceso</Heading>
            <Text style={styles.copy}>
              Usa este codigo para continuar con tu inicio de sesion. No lo compartas con nadie.
            </Text>
            <Section style={styles.otpBox}>
              <Text style={styles.otpLabel}>One-time password</Text>
              <Text style={styles.otp}>{otp}</Text>
            </Section>
            <Section style={styles.row}>
              <Text style={styles.rowLabel}>Expira en</Text>
              <Text style={styles.rowValue}>{expiresIn}</Text>
            </Section>
            <Hr style={styles.hr} />
            <Text style={styles.note}>
              Si no has solicitado este codigo, puedes ignorar este email.
            </Text>
          </Section>
          <Text style={styles.footer}>[ RoncalPhoto ] Seguridad de acceso</Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderOtpEmail(data: OtpEmailData): Promise<{ html: string; text: string }> {
  const email = <OtpEmail {...data} />;
  const [html, text] = await Promise.all([
    render(email),
    render(email, {
      plainText: true,
    }),
  ]);

  return { html, text };
}

export default OtpEmail;
