import { createApp } from "@/app/create-app";

import type { AppBindings } from "@/shared/config/types";

const app = createApp();

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<AppBindings["Bindings"]>;
