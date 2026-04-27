import { createApp } from "@/app/create-app";
import { registerOpenApi } from "@/config/config-open-api";

const app = createApp();

registerOpenApi(app);

export default {
  fetch: app.fetch,
};
