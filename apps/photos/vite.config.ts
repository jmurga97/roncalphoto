import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, "../..");
  const env = loadEnv(mode, envDir, "");
  const apiUrl = env.VITE_API_URL || env.API_URL || "http://localhost:8787";
  const apiKey = env.VITE_API_KEY || env.API_KEY || "";

  return {
    envDir,
    envPrefix: ["VITE_", "API_"],
    plugins: [
      tanstackRouter({
        generatedRouteTree: "./src/app/route-tree.gen.ts",
        routesDirectory: "./src/app/routes",
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@app": path.resolve(__dirname, "./src/app"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@modules": path.resolve(__dirname, "./src/modules"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@utils": path.resolve(__dirname, "./src/utils"),
      },
    },
    server: {
      host: true,
      proxy: {
        "/api": {
          changeOrigin: true,
          configure(proxy) {
            proxy.on("proxyReq", (proxyRequest) => {
              if (apiKey) {
                proxyRequest.setHeader("X-API-Key", apiKey);
              }
            });
          },
          target: apiUrl,
        },
        "/health": {
          changeOrigin: true,
          target: apiUrl,
        },
      },
    },
  };
});
