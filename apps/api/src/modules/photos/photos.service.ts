import * as photosRepository from "@roncal/db/repositories/photos.repository";

import { orNotFound } from "../../shared/errors";

import type { ListPhotosInput, UpdatePhotoInput } from "./photos-input.schema";
import type { AppDb } from "@roncal/db/client";

export function listPhotos(db: AppDb, input: ListPhotosInput) {
  return photosRepository.list(db, input);
}

export async function getPhoto(db: AppDb, id: string) {
  return orNotFound(await photosRepository.findById(db, id), "Photo");
}

export async function updatePhoto(db: AppDb, { id, data }: UpdatePhotoInput) {
  return orNotFound(await photosRepository.update(db, id, data), "Photo");
}

export async function deletePhoto(db: AppDb, id: string) {
  return orNotFound(await photosRepository.remove(db, id), "Photo");
}
