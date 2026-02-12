import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import { createCorsMiddleware } from "./middleware/cors";
import categories from "./routes/categories";
import photos from "./routes/photos";
import sessions from "./routes/sessions";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// Apply CORS middleware to all routes
app.use("*", async (c, next) => {
  const corsMiddleware = createCorsMiddleware(c.env);
  return corsMiddleware(c, next);
});

// Health check endpoint (no auth required)
app.get("/health", (c) => {
  return c.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

// API info endpoint (no auth required)
app.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      name: "RoncalPhoto API",
      version: "1.0.0",
      endpoints: {
        categories: "/api/categories",
        sessions: "/api/sessions",
        photos: "/api/photos",
      },
    },
  });
});

// Apply auth middleware to all /api routes
app.use("/api/*", authMiddleware);

// Mount route handlers
app.route("/api/categories", categories);
app.route("/api/sessions", sessions);
app.route("/api/photos", photos);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Not found",
    },
    404,
  );
});

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      error: "Internal server error",
    },
    500,
  );
});

export default app;
