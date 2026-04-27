import type { OpenApiApp } from "./types";

const openApiConfig = {
  openapi: "3.0.0",
  info: {
    title: "RoncalPhoto API",
    version: "2.0.0",
    description: "REST API for the RoncalPhoto photography portfolio.",
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      },
    },
  },
};

export function registerOpenApi(app: OpenApiApp) {
  app.doc("/doc", openApiConfig);
}
