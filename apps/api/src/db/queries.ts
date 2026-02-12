import type {
  Category,
  CategoryRow,
  Photo,
  PhotoMetadata,
  PhotoRow,
  Session,
  SessionRow,
} from "../types";

/**
 * Transform database row to API response format
 */
export function photoRowToPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    sessionId: row.session_id,
    url: row.url,
    miniature: row.miniature,
    alt: row.alt,
    about: row.about,
    sortOrder: row.sort_order,
    metadata: {
      iso: row.iso,
      aperture: row.aperture,
      shutterSpeed: row.shutter_speed,
      lens: row.lens,
      camera: row.camera,
    },
  };
}

export function sessionRowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
  };
}

export function categoryRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

/**
 * Generate a simple UUID-like ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

// ============== CATEGORIES ==============

export async function getAllCategories(db: D1Database): Promise<Category[]> {
  const { results } = await db.prepare("SELECT * FROM categories ORDER BY name").all<CategoryRow>();
  return results.map(categoryRowToCategory);
}

export async function getCategoryById(db: D1Database, id: string): Promise<Category | null> {
  const row = await db
    .prepare("SELECT * FROM categories WHERE id = ?")
    .bind(id)
    .first<CategoryRow>();
  return row ? categoryRowToCategory(row) : null;
}

export async function getCategoryBySlug(db: D1Database, slug: string): Promise<Category | null> {
  const row = await db
    .prepare("SELECT * FROM categories WHERE slug = ?")
    .bind(slug)
    .first<CategoryRow>();
  return row ? categoryRowToCategory(row) : null;
}

export async function getCategoryWithSessions(
  db: D1Database,
  slug: string,
): Promise<Category | null> {
  const category = await getCategoryBySlug(db, slug);
  if (!category) return null;

  const { results: sessionRows } = await db
    .prepare("SELECT * FROM sessions WHERE category_id = ? ORDER BY title")
    .bind(category.id)
    .all<SessionRow>();

  category.sessions = sessionRows.map(sessionRowToSession);
  return category;
}

export async function createCategory(
  db: D1Database,
  data: { id?: string; name: string; slug: string },
): Promise<Category> {
  const id = data.id || generateId();
  await db
    .prepare("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)")
    .bind(id, data.name, data.slug)
    .run();
  return { id, name: data.name, slug: data.slug };
}

export async function updateCategory(
  db: D1Database,
  id: string,
  data: { name?: string; slug?: string },
): Promise<Category | null> {
  const existing = await getCategoryById(db, id);
  if (!existing) return null;

  const name = data.name ?? existing.name;
  const slug = data.slug ?? existing.slug;

  await db
    .prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?")
    .bind(name, slug, id)
    .run();

  return { id, name, slug };
}

export async function deleteCategory(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
  return result.meta.changes > 0;
}

// ============== SESSIONS ==============

export async function getAllSessions(db: D1Database): Promise<Session[]> {
  const { results } = await db.prepare("SELECT * FROM sessions ORDER BY title").all<SessionRow>();
  return results.map(sessionRowToSession);
}

export async function getSessionById(db: D1Database, id: string): Promise<Session | null> {
  const row = await db.prepare("SELECT * FROM sessions WHERE id = ?").bind(id).first<SessionRow>();
  return row ? sessionRowToSession(row) : null;
}

export async function getSessionWithPhotos(db: D1Database, id: string): Promise<Session | null> {
  const session = await getSessionById(db, id);
  if (!session) return null;

  const { results: photoRows } = await db
    .prepare("SELECT * FROM photos WHERE session_id = ? ORDER BY sort_order, id")
    .bind(id)
    .all<PhotoRow>();

  session.photos = photoRows.map(photoRowToPhoto);
  return session;
}

export async function createSession(
  db: D1Database,
  data: { id?: string; categoryId: string; title: string; description: string },
): Promise<Session> {
  const id = data.id || generateId();
  await db
    .prepare("INSERT INTO sessions (id, category_id, title, description) VALUES (?, ?, ?, ?)")
    .bind(id, data.categoryId, data.title, data.description)
    .run();
  return {
    id,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
  };
}

export async function updateSession(
  db: D1Database,
  id: string,
  data: { categoryId?: string; title?: string; description?: string },
): Promise<Session | null> {
  const existing = await getSessionById(db, id);
  if (!existing) return null;

  const categoryId = data.categoryId ?? existing.categoryId;
  const title = data.title ?? existing.title;
  const description = data.description ?? existing.description;

  await db
    .prepare("UPDATE sessions SET category_id = ?, title = ?, description = ? WHERE id = ?")
    .bind(categoryId, title, description, id)
    .run();

  return { id, categoryId, title, description };
}

export async function deleteSession(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
  return result.meta.changes > 0;
}

// ============== PHOTOS ==============

export async function getAllPhotos(
  db: D1Database,
  options: { page?: number; pageSize?: number } = {},
): Promise<{ photos: Photo[]; total: number }> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const [countResult, photosResult] = await Promise.all([
    db.prepare("SELECT COUNT(*) as count FROM photos").first<{ count: number }>(),
    db
      .prepare("SELECT * FROM photos ORDER BY session_id, sort_order LIMIT ? OFFSET ?")
      .bind(pageSize, offset)
      .all<PhotoRow>(),
  ]);

  return {
    photos: photosResult.results.map(photoRowToPhoto),
    total: countResult?.count ?? 0,
  };
}

export async function getPhotoById(db: D1Database, id: string): Promise<Photo | null> {
  const row = await db.prepare("SELECT * FROM photos WHERE id = ?").bind(id).first<PhotoRow>();
  return row ? photoRowToPhoto(row) : null;
}

export async function createPhoto(
  db: D1Database,
  data: {
    id?: string;
    sessionId: string;
    url: string;
    miniature: string;
    alt: string;
    about: string;
    sortOrder?: number;
    metadata?: PhotoMetadata;
  },
): Promise<Photo> {
  const id = data.id || generateId();
  const sortOrder = data.sortOrder ?? 0;
  const metadata = data.metadata ?? {
    iso: null,
    aperture: null,
    shutterSpeed: null,
    lens: null,
    camera: null,
  };

  await db
    .prepare(
      `INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      data.sessionId,
      data.url,
      data.miniature,
      data.alt,
      data.about,
      sortOrder,
      metadata.iso,
      metadata.aperture,
      metadata.shutterSpeed,
      metadata.lens,
      metadata.camera,
    )
    .run();

  return {
    id,
    sessionId: data.sessionId,
    url: data.url,
    miniature: data.miniature,
    alt: data.alt,
    about: data.about,
    sortOrder,
    metadata,
  };
}

export async function updatePhoto(
  db: D1Database,
  id: string,
  data: {
    sessionId?: string;
    url?: string;
    miniature?: string;
    alt?: string;
    about?: string;
    sortOrder?: number;
    metadata?: Partial<PhotoMetadata>;
  },
): Promise<Photo | null> {
  const existing = await getPhotoById(db, id);
  if (!existing) return null;

  const updated: Photo = {
    id,
    sessionId: data.sessionId ?? existing.sessionId,
    url: data.url ?? existing.url,
    miniature: data.miniature ?? existing.miniature,
    alt: data.alt ?? existing.alt,
    about: data.about ?? existing.about,
    sortOrder: data.sortOrder ?? existing.sortOrder,
    metadata: {
      iso: data.metadata?.iso ?? existing.metadata.iso,
      aperture: data.metadata?.aperture ?? existing.metadata.aperture,
      shutterSpeed: data.metadata?.shutterSpeed ?? existing.metadata.shutterSpeed,
      lens: data.metadata?.lens ?? existing.metadata.lens,
      camera: data.metadata?.camera ?? existing.metadata.camera,
    },
  };

  await db
    .prepare(
      `UPDATE photos SET session_id = ?, url = ?, miniature = ?, alt = ?, about = ?, 
       sort_order = ?, iso = ?, aperture = ?, shutter_speed = ?, lens = ?, camera = ? 
       WHERE id = ?`,
    )
    .bind(
      updated.sessionId,
      updated.url,
      updated.miniature,
      updated.alt,
      updated.about,
      updated.sortOrder,
      updated.metadata.iso,
      updated.metadata.aperture,
      updated.metadata.shutterSpeed,
      updated.metadata.lens,
      updated.metadata.camera,
      id,
    )
    .run();

  return updated;
}

export async function deletePhoto(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare("DELETE FROM photos WHERE id = ?").bind(id).run();
  return result.meta.changes > 0;
}
