import { Button, Field, Input } from "@jmurga97/components";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { assertAuthResult, authClient } from "@lib/auth-client";
import { getErrorMessage } from "@utils/get-error-message";

import type { FormEvent } from "react";

type LoginStep = "email" | "otp";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (session) {
      redirect({ to: "/", throw: true });
    }
  },
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (step === "otp") otpInputRef.current?.focus();
  }, [step]);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      assertAuthResult(result);
      setOtp("");
      setStep("otp");
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, "No se ha podido completar la autenticación."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      assertAuthResult(result);
      await navigate({ to: "/" });
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, "No se ha podido completar la autenticación."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-shell">
      <section className="admin-login-panel" aria-labelledby="login-title">
        <div className="ming-page-header__title">
          <div className="admin-kicker">RoncalPhoto Dashboard</div>
          <h1 id="login-title">Acceso al portfolio</h1>
          <p>
            {step === "email"
              ? "Introduce tu email de administración para solicitar un código de un solo uso. Solo se enviará si el correo ya está autorizado."
              : `Si ${email} está autorizado, recibirás un código de 6 dígitos para completar el acceso.`}
          </p>
        </div>

        {step === "email" ? (
          <form
            className="admin-login-form"
            onSubmit={(event) => {
              void handleEmailSubmit(event);
            }}
          >
            <Field label="Email">
              <Input
                autoComplete="email"
                disabled={isSubmitting}
                onValueChange={setEmail}
                placeholder="nombre@roncalphoto.com"
                required
                type="email"
                value={email}
              />
            </Field>

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Solicitando…" : "Solicitar código"}
            </Button>
          </form>
        ) : (
          <form
            className="admin-login-form"
            onSubmit={(event) => {
              void handleOtpSubmit(event);
            }}
          >
            <Field label="Código de acceso">
              <Input
                ref={otpInputRef}
                autoComplete="one-time-code"
                disabled={isSubmitting}
                inputMode="numeric"
                maxLength={6}
                onValueChange={(value) => {
                  setOtp(value.replaceAll(/\D/g, "").slice(0, 6));
                }}
                pattern="[0-9]{6}"
                minLength={6}
                placeholder="000000"
                required
                type="text"
                value={otp}
              />
            </Field>

            <div className="admin-login-actions">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Verificando…" : "Entrar"}
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() => {
                  setOtp("");
                  setStep("email");
                }}
                type="button"
                variant="secondary"
              >
                Cambiar email
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
