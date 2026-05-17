import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vite";

const isTailwindBuildSourcemapWarning = (warning: {
  code?: string;
  message?: string;
  plugin?: string;
}) =>
  warning.code === "PLUGIN_WARNING" &&
  warning.plugin === "@tailwindcss/vite:generate:build" &&
  warning.message?.includes("Sourcemap is likely to be incorrect");

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, "../..");
  const env = loadEnv(mode, envDir, "");
  const apiUrl = env.VITE_API_URL || "http://localhost:8787";

  return {
    envDir,
    envPrefix: "VITE_",
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

        "@utils": path.resolve(__dirname, "./src/utils"),
      },
    },
    server: {
      host: true,
      proxy: {
        "/api": {
          changeOrigin: true,
          target: apiUrl,
        },
        "/health": {
          changeOrigin: true,
          target: apiUrl,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          // Tailwind's Vite plugin currently emits this sourcemap warning
          // during production CSS transforms even when the build succeeds.
          if (isTailwindBuildSourcemapWarning(warning)) {
            return;
          }

          defaultHandler(warning);
        },
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            tanstack: ["@tanstack/react-router", "@tanstack/react-query", "zod"],
            state: ["zustand"],
          },
        },
      },
    },
  };
});
