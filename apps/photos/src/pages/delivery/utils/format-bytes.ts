const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

function formatUnit(unit: (typeof UNITS)[number], value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
    style: "unit",
    unit,
    unitDisplay: "narrow",
  }).format(value);
}

/**
 * Formats a byte count into a human-readable size, e.g. 8421003 -> "8,0 MB".
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return formatUnit("byte", 0, 0);

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const fractionDigits = exponent === 0 || value >= 100 ? 0 : 1;

  return formatUnit(UNITS[exponent] ?? "byte", value, fractionDigits);
}
