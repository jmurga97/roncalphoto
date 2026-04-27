interface KeyboardNavigationInput {
  currentIndex: number;
  key: string;
  maxIndex: number;
}

export function resolveNextIndexFromKey({
  key,
  currentIndex,
  maxIndex,
}: KeyboardNavigationInput): number | null {
  if (key === "ArrowDown" || key === "ArrowRight") {
    return Math.min(currentIndex + 1, maxIndex);
  }

  if (key === "ArrowUp" || key === "ArrowLeft") {
    return Math.max(currentIndex - 1, 0);
  }

  return null;
}
