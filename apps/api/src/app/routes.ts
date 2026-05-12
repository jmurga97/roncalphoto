import photosRoutes from "@/modules/photos/routes";
import sessionsRoutes from "@/modules/sessions/routes";
import tagsRoutes from "@/modules/tags/routes";

import type { OpenApiApp } from "@/config/types";

export function registerRoutes(app: OpenApiApp) {
  app.route("/api/sessions", sessionsRoutes);
  app.route("/api/photos", photosRoutes);
  app.route("/api/tags", tagsRoutes);
}
