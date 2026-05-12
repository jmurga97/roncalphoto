import otpRoutes from "@/modules/otp/routes";

import type { App } from "@/config/types";

export function registerRoutes(app: App) {
  app.route("/send", otpRoutes);
}
