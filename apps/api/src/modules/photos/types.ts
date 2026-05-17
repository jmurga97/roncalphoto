import type { PhotoMetadata } from "@roncal/shared";

export interface CreatePhotoInput {
  id?: string;
  sessionId: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sortOrder?: number;
  metadata?: Partial<PhotoMetadata>;
}

export type UpdatePhotoInput = Partial<Omit<CreatePhotoInput, "id">>;
