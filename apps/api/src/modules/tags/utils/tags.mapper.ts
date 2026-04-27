import type { tags } from "@/db";
import type { ApiSession, Tag } from "@roncal/shared";

type TagRow = typeof tags.$inferSelect;

export function toTag(row: TagRow | { id: string; name: string; slug: string }): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

export function toApiSession(
  row: {
    id: string;
    slug: string;
    title: string;
    description: string;
    created_at: string;
  },
  tagsForSession: Tag[],
): ApiSession {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    tags: tagsForSession,
  };
}
