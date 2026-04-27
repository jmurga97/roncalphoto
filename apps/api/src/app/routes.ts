import type { OpenApiApp } from "@/config/types";
import photosRoutes from "@/modules/photos/routes";
import sessionsRoutes from "@/modules/sessions/routes";
import tagsRoutes from "@/modules/tags/routes";

export function registerRoutes(app: OpenApiApp) {
  app.route("/api/sessions", sessionsRoutes);
  app.route("/api/photos", photosRoutes);
  app.route("/api/tags", tagsRoutes);
}
