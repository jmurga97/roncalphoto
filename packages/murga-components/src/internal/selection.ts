export function normalizeSelectedIds(value: string[] | null | undefined) {
  if (!value) {
    return [];
  }

  return Array.from(new Set(value.filter((item) => item.length > 0)));
}

export function toggleSelectedId(selectedIds: string[], itemId: string) {
  return selectedIds.includes(itemId)
    ? selectedIds.filter((selectedId) => selectedId !== itemId)
    : [...selectedIds, itemId];
}

export function findItemById<TItem extends { id: string }>(
  items: TItem[],
  selectedId: string | null | undefined,
) {
  if (!selectedId) {
    return null;
  }

  return items.find((item) => item.id === selectedId) ?? null;
}

export function resolveNextItemId<TItem extends { id: string }>(
  items: TItem[],
  currentId: string | null | undefined,
  delta: number,
) {
  if (items.length === 0) {
    return null;
  }

  const currentIndex = currentId ? items.findIndex((item) => item.id === currentId) : -1;
  const nextIndex =
    currentIndex === -1 ? 0 : Math.min(items.length - 1, Math.max(0, currentIndex + delta));

  return items[nextIndex]?.id ?? null;
}
