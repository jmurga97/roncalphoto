import * as sessionsRepository from "@roncal/db/repositories/sessions.repository";
import { TRPCError } from "@trpc/server";

import { orNotFound } from "../../shared/errors";

import type { CreateSessionInput, UpdateSessionInput } from "./sessions-input.schema";
import type { AppDb } from "@roncal/db/client";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

async function nextFreeSlug(db: AppDb, value: string, excludeId?: string): Promise<string> {
  const base = slugify(value);

  if (!base) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The slug needs letters or numbers" });
  }

  const taken = new Set(await sessionsRepository.listSlugsLike(db, base, excludeId));
  let slug = base;

  let suffix = 2;
  while (taken.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function listSessions(db: AppDb) {
  return sessionsRepository.list(db);
}

export function listCanvasSessions(db: AppDb) {
  return sessionsRepository.listWithPhotos(db);
}

export async function getSession(db: AppDb, slug: string) {
  return orNotFound(await sessionsRepository.findBySlug(db, slug), "Session");
}

export async function createSession(db: AppDb, { tagIds, ...input }: CreateSessionInput) {
  const slug = await nextFreeSlug(db, input.slug ?? input.title);

  await sessionsRepository.insert(db, { slug, title: input.title, description: input.description }, tagIds);

  return getSession(db, slug);
}

export async function updateSession(db: AppDb, { slug, data }: UpdateSessionInput) {
  const current = await getSession(db, slug);
  const nextSlug = data.slug === undefined ? current.slug : await nextFreeSlug(db, data.slug, current.id);

  await sessionsRepository.update(
    db,
    current.id,
    {
      slug: nextSlug,
      title: data.title ?? current.title,
      description: data.description ?? current.description,
    },
    data.tagIds,
  );

  return getSession(db, nextSlug);
}

export async function deleteSession(db: AppDb, slug: string) {
  return orNotFound(await sessionsRepository.removeBySlug(db, slug), "Session");
}
