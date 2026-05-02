const unsafeFilenameCharacters = /[^a-zA-Z0-9._-]+/g;

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function sanitizeFilename(filename: string): string {
  const normalized = filename.trim().replace(unsafeFilenameCharacters, "-").replace(/-+/g, "-");
  return normalized.length > 0 ? normalized : "original";
}

function encodeKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function createUploadObjectKeys(input: {
  filename: string;
  photoId: string;
  sessionId: string;
}) {
  const filename = sanitizeFilename(input.filename);
  const baseKey = `sessions/${input.sessionId}/${input.photoId}`;

  return {
    originalKey: `${baseKey}/original/${filename}`,
    mainKey: `${baseKey}/main.webp`,
    thumbnailKey: `${baseKey}/thumb.webp`,
  };
}

export function createPublicMediaUrl(baseUrl: string, key: string): string {
  return `${trimSlashes(baseUrl)}/${encodeKey(key)}`;
}
