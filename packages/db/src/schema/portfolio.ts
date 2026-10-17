import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (table) => [uniqueIndex("tags_slug_unique").on(table.slug)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("sessions_slug_unique").on(table.slug), index("idx_sessions_created_at").on(table.createdAt)],
);

export const sessionTags = sqliteTable(
  "session_tags",
  {
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.sessionId, table.tagId] }), index("idx_session_tags_tag").on(table.tagId)],
);

export const photos = sqliteTable(
  "photos",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    miniature: text("miniature").notNull(),
    alt: text("alt").notNull(),
    about: text("about").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    iso: integer("iso"),
    aperture: text("aperture"),
    shutterSpeed: text("shutter_speed"),
    lens: text("lens"),
    camera: text("camera"),
  },
  (table) => [index("idx_photos_sort").on(table.sessionId, table.sortOrder)],
);

export const sessionsRelations = relations(sessions, ({ many }) => ({
  photos: many(photos),
  sessionTags: many(sessionTags),
}));

export const sessionTagsRelations = relations(sessionTags, ({ one }) => ({
  session: one(sessions, { fields: [sessionTags.sessionId], references: [sessions.id] }),
  tag: one(tags, { fields: [sessionTags.tagId], references: [tags.id] }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  session: one(sessions, { fields: [photos.sessionId], references: [sessions.id] }),
}));
