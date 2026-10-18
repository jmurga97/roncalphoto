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

/**
 * Without a selection the arrows pan the canvas. With the session stage open
 * the arrows belong to its gallery and Escape closes it.
 */
export function useCanvasKeyboard(options: UseCanvasKeyboardOptions) {
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || event.defaultPrevented) {
        return;
      }

      const current = optionsRef.current;

      if (current.hasSelection) {
        if (event.key === "Escape") {
          event.preventDefault();
          current.onClose();
        }

        return;
      }

      const delta = PAN_DELTAS[event.key];

      if (delta) {
        event.preventDefault();
        current.onPan(delta[0], delta[1]);
      }
    };

    document.addEventListener("keydown", onDocumentKeydown);

    return () => {
      document.removeEventListener("keydown", onDocumentKeydown);
    };
  }, []);
}
