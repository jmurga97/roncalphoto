import type { App } from "@/config/types";
import uploadRoutes from "@/modules/uploads/routes";

export function registerRoutes(app: App) {
  app.route("/api/images", uploadRoutes);
}
