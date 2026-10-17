import * as sessionsRepository from "@roncal/db/repositories/sessions.repository";
import * as tagsRepository from "@roncal/db/repositories/tags.repository";

import { orNotFound } from "../../shared/errors";

import type { AppDb } from "@roncal/db/client";

export function listTags(db: AppDb) {
  return tagsRepository.list(db);
}

export async function getTag(db: AppDb, slug: string) {
  const tag = orNotFound(await tagsRepository.findBySlug(db, slug), "Tag");

  return { tag, sessions: await sessionsRepository.list(db, { tagId: tag.id }) };
}
