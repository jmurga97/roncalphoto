import { Hono } from "hono";
import {
  createCategory,
  getAllCategories,
  getCategoryWithSessions,
  updateCategory,
} from "../db/queries";
import type { CreateCategoryDto, Env, UpdateCategoryDto } from "../types";

const categories = new Hono<{ Bindings: Env }>();

/**
 * GET /api/categories
 * List all categories
 */
categories.get("/", async (c) => {
  try {
    const results = await getAllCategories(c.env.DB_RONCALPHOTO);
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ success: false, error: "Failed to fetch categories" }, 500);
  }
});

/**
 * GET /api/categories/:slug
 * Get a category by slug with its sessions
 */
categories.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const category = await getCategoryWithSessions(c.env.DB_RONCALPHOTO, slug);

    if (!category) {
      return c.json({ success: false, error: "Category not found" }, 404);
    }

    return c.json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return c.json({ success: false, error: "Failed to fetch category" }, 500);
  }
});

/**
 * POST /api/categories
 * Create a new category
 */
categories.post("/", async (c) => {
  try {
    const body = await c.req.json<CreateCategoryDto>();

    if (!body.name || !body.slug) {
      return c.json({ success: false, error: "name and slug are required" }, 400);
    }

    const category = await createCategory(c.env.DB_RONCALPHOTO, body);
    return c.json({ success: true, data: category }, 201);
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Error && error.message?.includes("UNIQUE constraint failed")) {
      return c.json({ success: false, error: "Category with this slug already exists" }, 409);
    }
    return c.json({ success: false, error: "Failed to create category" }, 500);
  }
});

/**
 * PUT /api/categories/:id
 * Update a category
 */
categories.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json<UpdateCategoryDto>();

    const category = await updateCategory(c.env.DB_RONCALPHOTO, id, body);

    if (!category) {
      return c.json({ success: false, error: "Category not found" }, 404);
    }

    return c.json({ success: true, data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof Error && error.message?.includes("UNIQUE constraint failed")) {
      return c.json({ success: false, error: "Category with this slug already exists" }, 409);
    }
    return c.json({ success: false, error: "Failed to update category" }, 500);
  }
});

export default categories;
