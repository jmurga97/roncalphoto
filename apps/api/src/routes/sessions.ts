import { Hono } from "hono";
import {
  createSession,
  deleteSession,
  getAllSessions,
  getSessionWithPhotos,
  updateSession,
} from "../db/queries";
import type { CreateSessionDto, Env, UpdateSessionDto } from "../types";

const sessions = new Hono<{ Bindings: Env }>();

/**
 * GET /api/sessions
 * List all sessions
 */
sessions.get("/", async (c) => {
  try {
    const results = await getAllSessions(c.env.DB_RONCALPHOTO);
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return c.json({ success: false, error: "Failed to fetch sessions" }, 500);
  }
});

/**
 * GET /api/sessions/:id
 * Get a session by ID with its photos
 */
sessions.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const session = await getSessionWithPhotos(c.env.DB_RONCALPHOTO, id);

    if (!session) {
      return c.json({ success: false, error: "Session not found" }, 404);
    }

    return c.json({ success: true, data: session });
  } catch (error) {
    console.error("Error fetching session:", error);
    return c.json({ success: false, error: "Failed to fetch session" }, 500);
  }
});

/**
 * POST /api/sessions
 * Create a new session
 */
sessions.post("/", async (c) => {
  try {
    const body = await c.req.json<CreateSessionDto>();

    if (!body.categoryId || !body.title || !body.description) {
      return c.json(
        {
          success: false,
          error: "categoryId, title, and description are required",
        },
        400,
      );
    }

    const session = await createSession(c.env.DB_RONCALPHOTO, body);
    return c.json({ success: true, data: session }, 201);
  } catch (error) {
    console.error("Error creating session:", error);
    if (error instanceof Error && error.message?.includes("FOREIGN KEY constraint failed")) {
      return c.json({ success: false, error: "Category not found" }, 400);
    }
    return c.json({ success: false, error: "Failed to create session" }, 500);
  }
});

/**
 * PUT /api/sessions/:id
 * Update a session
 */
sessions.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json<UpdateSessionDto>();

    const session = await updateSession(c.env.DB_RONCALPHOTO, id, body);

    if (!session) {
      return c.json({ success: false, error: "Session not found" }, 404);
    }

    return c.json({ success: true, data: session });
  } catch (error) {
    console.error("Error updating session:", error);
    if (error instanceof Error && error.message?.includes("FOREIGN KEY constraint failed")) {
      return c.json({ success: false, error: "Category not found" }, 400);
    }
    return c.json({ success: false, error: "Failed to update session" }, 500);
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete a session (cascades to photos)
 */
sessions.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const deleted = await deleteSession(c.env.DB_RONCALPHOTO, id);

    if (!deleted) {
      return c.json({ success: false, error: "Session not found" }, 404);
    }

    return c.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("Error deleting session:", error);
    return c.json({ success: false, error: "Failed to delete session" }, 500);
  }
});

export default sessions;
