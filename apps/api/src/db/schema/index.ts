import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

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
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("sessions_slug_unique").on(table.slug),
    index("idx_sessions_slug").on(table.slug),
    index("idx_sessions_created_at").on(table.created_at),
  ],
);

export const sessionTags = sqliteTable(
  "session_tags",
  {
    session_id: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    tag_id: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.session_id, table.tag_id] }),
    index("idx_session_tags_session").on(table.session_id),
    index("idx_session_tags_tag").on(table.tag_id),
  ],
);

export const photos = sqliteTable(
  "photos",
  {
    id: text("id").primaryKey(),
    session_id: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    miniature: text("miniature").notNull(),
    alt: text("alt").notNull(),
    about: text("about").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    iso: integer("iso"),
    aperture: text("aperture"),
    shutter_speed: text("shutter_speed"),
    lens: text("lens"),
    camera: text("camera"),
  },
  (table) => [
    index("idx_photos_session").on(table.session_id),
    index("idx_photos_sort").on(table.session_id, table.sort_order),
  ],
);

export const tagsRelations = relations(tags, ({ many }) => ({
  session_tags: many(sessionTags),
}));

export const sessionsRelations = relations(sessions, ({ many }) => ({
  photos: many(photos),
  session_tags: many(sessionTags),
}));

export const sessionTagsRelations = relations(sessionTags, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionTags.session_id],
    references: [sessions.id],
  }),
  tag: one(tags, {
    fields: [sessionTags.tag_id],
    references: [tags.id],
  }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  session: one(sessions, {
    fields: [photos.session_id],
    references: [sessions.id],
  }),
}));
