import { useCallback, useRef, useState } from "react";

import { HINT_STORAGE_KEY } from "../constants";

function hasSeenHint(): boolean {
  try {
    return localStorage.getItem(HINT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * First-visit hint: visible until the first interaction, then never again.
 */
export function useCanvasHint() {
  const [isVisible, setIsVisible] = useState(() => !hasSeenHint());
  const isDismissedRef = useRef(!isVisible);

  const dismiss = useCallback(() => {
    if (isDismissedRef.current) {
      return;
    }

    isDismissedRef.current = true;
    setIsVisible(false);

    try {
      localStorage.setItem(HINT_STORAGE_KEY, "true");
    } catch {
      // Storage unavailable (private mode): the hint simply shows again next visit.
    }
  }, []);

  return { dismiss, isVisible };
}
