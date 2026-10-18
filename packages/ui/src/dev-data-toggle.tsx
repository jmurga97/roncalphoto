// Dev-only "Demo data / Worst case" switch. Apps render it and read the mode only behind
// `import.meta.env.DEV`; the fixtures live in `@roncal/api/dev-fixtures`.

import { useEffect, useState } from "react";

import { getDataMode, MODES, selectMode } from "./dev-data-mode";

export function DataModeToggle() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function toggleVisibility(event: KeyboardEvent) {
      if (
        !event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.code !== "Digit3" ||
        event.repeat
      ) {
        return;
      }

      event.preventDefault();
      setIsVisible((visible) => !visible);
    }

    window.addEventListener("keydown", toggleVisibility, true);
    return () => window.removeEventListener("keydown", toggleVisibility, true);
  }, []);

  if (!isVisible) return null;

  const current = getDataMode();

  return (
    <aside
      aria-label="Datos de desarrollo"
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2_147_483_647,
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: 999,
        background: "#d4d4d4",
        font: "500 11px/1 system-ui, sans-serif",
        boxShadow: "0 1px 4px rgb(0 0 0 / 0.2)",
        maxWidth: "calc(100vw - 16px)",
        overflowX: "auto",
      }}
    >
      {MODES.map(([mode, label]) => (
        <button
          aria-pressed={mode === current}
          key={mode}
          onClick={() => selectMode(mode)}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "6px 10px",
            whiteSpace: "nowrap",
            cursor: "pointer",
            color: "#171717",
            background: mode === current ? "#fff" : "transparent",
          }}
          type="button"
        >
          {label}
        </button>
      ))}
    </aside>
  );
}
