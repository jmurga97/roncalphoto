import { useEffect, useId, useRef, useState } from "react";

interface DeliveryRowMenuProps {
  deliveryTitle: string;
  expanded: boolean;
  onToggleDetail: () => void;
}

export function DeliveryRowMenu({ deliveryTitle, expanded, onToggleDetail }: DeliveryRowMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <mc-button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Acciones para ${deliveryTitle}`}
        onClick={() => {
          setOpen((current) => !current);
        }}
        size="sm"
        variant="ghost"
      >
        ⋯
      </mc-button>
      {open ? (
        <div
          className="border-mc-border-visible bg-mc-surface-raised absolute top-[calc(100%+0.25rem)] right-0 z-10 grid min-w-44 gap-0.5 rounded-lg border p-1"
          id={menuId}
          role="menu"
        >
          <button
            className="text-mc-text-primary hover:bg-mc-surface focus-visible:outline-mc-accent cursor-pointer rounded-md border-0 bg-transparent px-3 py-2 text-left font-mono text-[0.75rem] tracking-[0.04em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => {
              onToggleDetail();
              setOpen(false);
            }}
            role="menuitem"
            type="button"
          >
            {expanded ? "Ocultar detalle" : "Más detalle"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
