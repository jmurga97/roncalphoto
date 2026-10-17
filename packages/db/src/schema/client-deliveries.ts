import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const clientDeliveries = sqliteTable(
  "client_deliveries",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull(),
    title: text("title").notNull(),
    clientEmail: text("client_email").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    expiresAt: text("expires_at").notNull(),
    photosDeletedAt: text("photos_deleted_at"),
  },
  (table) => [
    uniqueIndex("client_deliveries_token_unique").on(table.token),
    index("idx_client_deliveries_expires_at").on(table.expiresAt),
  ],
);

export const deliveryPhotos = sqliteTable(
  "delivery_photos",
  {
    id: text("id").primaryKey(),
    deliveryId: text("delivery_id")
      .notNull()
      .references(() => clientDeliveries.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    r2Key: text("r2_key").notNull(),
    title: text("title").notNull(),
    takenAt: text("taken_at"),
    sizeBytes: integer("size_bytes").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("idx_delivery_photos_delivery").on(table.deliveryId)],
);

export const clientDeliveriesRelations = relations(clientDeliveries, ({ many }) => ({
  photos: many(deliveryPhotos),
}));

export const deliveryPhotosRelations = relations(deliveryPhotos, ({ one }) => ({
  delivery: one(clientDeliveries, {
    fields: [deliveryPhotos.deliveryId],
    references: [clientDeliveries.id],
  }),
}));
