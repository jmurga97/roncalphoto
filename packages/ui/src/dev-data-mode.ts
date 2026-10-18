// Dev-only data mode for the `DataModeToggle` (`?data=worst|empty|one|huge`).

export const MODES = [
  ["demo", "Demo data"],
  ["worst", "Worst case"],
  ["empty", "Empty"],
  ["one", "One"],
  ["huge", "1,000+ rows"],
] as const;

export type DataMode = (typeof MODES)[number][0];

const STORAGE_KEY = "roncal-dev-data";

function toMode(value: string | null): DataMode {
  return MODES.find(([mode]) => mode === value)?.[0] ?? "demo";
}

/** `?data=` wins and is remembered for the tab, since route navigations drop unknown search params. */
export function getDataMode(): DataMode {
  const fromUrl = new URLSearchParams(location.search).get("data");

  try {
    if (fromUrl) sessionStorage.setItem(STORAGE_KEY, fromUrl);
    return toMode(fromUrl ?? sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return toMode(fromUrl);
  }
}

export function selectMode(mode: DataMode) {
  try {
    sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* The URL still carries it. */
  }

  const url = new URL(location.href);

  if (mode === "demo") url.searchParams.delete("data");
  else url.searchParams.set("data", mode);

  // Full reload: the query cache and every loader start from the new dataset.
  location.assign(url);
}
