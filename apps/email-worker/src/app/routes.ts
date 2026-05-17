import otpRoutes from "@/modules/otp/routes";

import type { App } from "@/shared/config/types";

export function registerRoutes(app: App) {
  app.route("/send", otpRoutes);
}
