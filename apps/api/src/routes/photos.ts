import { Hono } from "hono";
import { createPhoto, deletePhoto, getAllPhotos, getPhotoById, updatePhoto } from "../db/queries";
import type { CreatePhotoDto, Env, UpdatePhotoDto } from "../types";

const photos = new Hono<{ Bindings: Env }>();

/**
 * GET /api/photos
 * List all photos with pagination
 * Query params: page (default 1), pageSize (default 20, max 100)
 */
photos.get("/", async (c) => {
  try {
    const page = Number.parseInt(c.req.query("page") || "1", 10);
    const pageSize = Math.min(Number.parseInt(c.req.query("pageSize") || "20", 10), 100);

    const { photos: results, total } = await getAllPhotos(c.env.DB_RONCALPHOTO, {
      page,
      pageSize,
    });

    return c.json({
      success: true,
      data: results,
      pagination: {
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return c.json({ success: false, error: "Failed to fetch photos" }, 500);
  }
});

/**
 * GET /api/photos/:id
 * Get a single photo by ID
 */
photos.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const photo = await getPhotoById(c.env.DB_RONCALPHOTO, id);

    if (!photo) {
      return c.json({ success: false, error: "Photo not found" }, 404);
    }

    return c.json({ success: true, data: photo });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return c.json({ success: false, error: "Failed to fetch photo" }, 500);
  }
});

/**
 * POST /api/photos
 * Create a new photo
 */
photos.post("/", async (c) => {
  try {
    const body = await c.req.json<CreatePhotoDto>();

    if (!body.sessionId || !body.url || !body.miniature || !body.alt || !body.about) {
      return c.json(
        {
          success: false,
          error: "sessionId, url, miniature, alt, and about are required",
        },
        400,
      );
    }

    const photo = await createPhoto(c.env.DB_RONCALPHOTO, body);
    return c.json({ success: true, data: photo }, 201);
  } catch (error) {
    console.error("Error creating photo:", error);
    if (error instanceof Error && error.message?.includes("FOREIGN KEY constraint failed")) {
      return c.json({ success: false, error: "Session not found" }, 400);
    }
    return c.json({ success: false, error: "Failed to create photo" }, 500);
  }
});

/**
 * PUT /api/photos/:id
 * Update a photo
 */
photos.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json<UpdatePhotoDto>();

    const photo = await updatePhoto(c.env.DB_RONCALPHOTO, id, body);

    if (!photo) {
      return c.json({ success: false, error: "Photo not found" }, 404);
    }

    return c.json({ success: true, data: photo });
  } catch (error) {
    console.error("Error updating photo:", error);
    if (error instanceof Error && error.message?.includes("FOREIGN KEY constraint failed")) {
      return c.json({ success: false, error: "Session not found" }, 400);
    }
    return c.json({ success: false, error: "Failed to update photo" }, 500);
  }
});

/**
 * DELETE /api/photos/:id
 * Delete a photo
 */
photos.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const deleted = await deletePhoto(c.env.DB_RONCALPHOTO, id);

    if (!deleted) {
      return c.json({ success: false, error: "Photo not found" }, 404);
    }

    return c.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return c.json({ success: false, error: "Failed to delete photo" }, 500);
  }
});

export default photos;
