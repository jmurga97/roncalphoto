import { useEffect, useRef } from "react";

import { isEditableTarget } from "@utils/is-editable-target";

import { KEYBOARD_PAN_STEP_PX } from "../constants";

interface UseCanvasKeyboardOptions {
  hasSelection: boolean;
  onClose: () => void;
  onPan: (deltaX: number, deltaY: number) => void;
}

// Moving the view right means translating the world content left, hence the
// inverted deltas.
const PAN_DELTAS: Record<string, [number, number]> = {
  ArrowDown: [0, -KEYBOARD_PAN_STEP_PX],
  ArrowLeft: [KEYBOARD_PAN_STEP_PX, 0],
  ArrowRight: [-KEYBOARD_PAN_STEP_PX, 0],
  ArrowUp: [0, KEYBOARD_PAN_STEP_PX],
};

export function useCanvasKeyboard({ hasSelection, onClose, onPan }: UseCanvasKeyboardOptions) {
  const stateRef = useRef({ hasSelection, onClose, onPan });

  stateRef.current = { hasSelection, onClose, onPan };

  useEffect(() => {
    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const current = stateRef.current;

      if (event.key === "Escape" && current.hasSelection) {
        event.preventDefault();
        current.onClose();
        return;
      }

      const delta = PAN_DELTAS[event.key];

      if (!delta || current.hasSelection) {
        return;
      }

      event.preventDefault();
      current.onPan(delta[0], delta[1]);
    };

    document.addEventListener("keydown", onDocumentKeydown);

    return () => {
      document.removeEventListener("keydown", onDocumentKeydown);
    };
  }, []);
}
