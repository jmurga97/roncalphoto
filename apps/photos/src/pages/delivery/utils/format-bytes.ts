const UNITS = ["B", "KB", "MB", "GB", "TB"];

/**
 * Formats a byte count into a human-readable size, e.g. 8421003 -> "8.0 MB".
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const fractionDigits = exponent === 0 || value >= 100 ? 0 : 1;

  return `${value.toFixed(fractionDigits)} ${UNITS[exponent]}`;
}
