/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * URL of the d1-roncalphoto API.
   * Example: https://d1-roncalphoto.your-subdomain.workers.dev
   */
  readonly API_URL: string;

  /**
   * API key for authentication with d1-roncalphoto.
   * Required for all /api/* endpoints.
   */
  readonly API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
