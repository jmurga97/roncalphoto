const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function isFocusable(element: HTMLElement) {
  return !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true";
}

function getFocusableFromAssignedElements(root: ParentNode) {
  if (!("querySelectorAll" in root)) {
    return [];
  }

  const slotElements = Array.from(root.querySelectorAll("slot"));
  const focusableElements: HTMLElement[] = [];

  for (const slotElement of slotElements) {
    const assignedElements = slotElement.assignedElements({ flatten: true });

    for (const assignedElement of assignedElements) {
      if (assignedElement instanceof HTMLElement && assignedElement.matches(FOCUSABLE_SELECTOR)) {
        focusableElements.push(assignedElement);
      }

      focusableElements.push(
        ...Array.from(assignedElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          isFocusable,
        ),
      );
    }
  }

  return focusableElements.filter(isFocusable);
}

export function getFocusableElements(root: ParentNode) {
  return Array.from(
    new Set([
      ...Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isFocusable),
      ...getFocusableFromAssignedElements(root),
    ]),
  );
}

export function focusFirstElement(root: ParentNode) {
  const firstElement = getFocusableElements(root)[0];
  firstElement?.focus();
}

export function createFocusTrap(
  container: HTMLElement,
  options: {
    onEscape?: () => void;
  } = {},
) {
  const previousActiveElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      options.onEscape?.();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  queueMicrotask(() => {
    focusFirstElement(container);
  });

  return () => {
    document.removeEventListener("keydown", handleKeyDown);

    if (previousActiveElement?.isConnected) {
      previousActiveElement.focus();
    }
  };
}
