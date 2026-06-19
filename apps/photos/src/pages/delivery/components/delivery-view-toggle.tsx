import type { DeliveryViewMode } from "../types";

interface DeliveryViewToggleProps {
  mode: DeliveryViewMode;
  onToggle: () => void;
}

export function DeliveryViewToggle({ mode, onToggle }: DeliveryViewToggleProps) {
  const label = mode === "list" ? "Ver galería" : "Ver lista";

  return (
    <button
      aria-label={label}
      className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full border ui-divider bg-[color:var(--color-surface)] px-4 py-2.5 text-sm font-semibold shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true">{mode === "list" ? "▦" : "☰"}</span>
      {label}
    </button>
  );
}
