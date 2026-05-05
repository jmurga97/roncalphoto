import type { App } from "@/config/types";
import otpRoutes from "@/modules/otp/routes";

export function registerRoutes(app: App) {
  app.route("/send", otpRoutes);
}
