interface PhotoUploadAttemptInput {
  sessionId: string;
  alt: string;
  about: string;
  sortOrder?: number;
  metadata?: {
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    lens?: string;
    camera?: string;
  };
}

export interface PhotoUploadAttempt {
  file: File;
  fingerprint: string;
  idempotencyKey: string;
}

function createFingerprint(input: PhotoUploadAttemptInput): string {
  return JSON.stringify({
    sessionId: input.sessionId,
    alt: input.alt,
    about: input.about,
    sortOrder: input.sortOrder ?? 0,
    metadata: {
      iso: input.metadata?.iso ?? null,
      aperture: input.metadata?.aperture ?? null,
      shutterSpeed: input.metadata?.shutterSpeed ?? null,
      lens: input.metadata?.lens ?? null,
      camera: input.metadata?.camera ?? null,
    },
  });
}

export function resolvePhotoUploadAttempt(
  current: PhotoUploadAttempt | null,
  file: File,
  input: PhotoUploadAttemptInput,
  generateIdempotencyKey: () => string = () => crypto.randomUUID(),
): PhotoUploadAttempt {
  const fingerprint = createFingerprint(input);

  if (current?.file === file && current.fingerprint === fingerprint) {
    return current;
  }

  return {
    file,
    fingerprint,
    idempotencyKey: generateIdempotencyKey(),
  };
}
