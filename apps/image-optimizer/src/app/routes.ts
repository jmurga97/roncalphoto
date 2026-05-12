import uploadRoutes from "@/modules/uploads/routes";

import type { App } from "@/config/types";

export function registerRoutes(app: App) {
  app.route("/api/images", uploadRoutes);
}
