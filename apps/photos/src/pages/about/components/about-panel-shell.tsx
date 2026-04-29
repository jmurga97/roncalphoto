import type { ReactNode, RefObject } from "react";

interface AboutPanelShellProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  panelId: string;
  panelRef: RefObject<HTMLDialogElement | null>;
  titleId: string;
}

export function AboutPanelShell({
  children,
  isOpen,
  onClose,
  panelId,
  panelRef,
  titleId,
}: AboutPanelShellProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={[
        "fixed inset-0 z-[70] overflow-hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      data-about-open={isOpen ? "true" : "false"}
    >
      <div
        aria-hidden="true"
        className={[
          "about-backdrop absolute inset-0",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      />

      <dialog
        aria-labelledby={titleId}
        aria-modal="true"
        className={[
          "about-panel fixed inset-0 flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        id={panelId}
        open
        ref={panelRef}
      >
        <div className="flex justify-center border-b px-4 py-3 ui-divider sm:px-6 sm:py-4">
          <button
            aria-label="Cerrar Sobre nosotros"
            className="about-sheet-handle inline-flex items-center justify-center rounded-full border px-4 py-2 ui-divider ui-link"
            data-about-focus-target="true"
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
          <div className="container mx-auto">{children}</div>
        </div>
      </dialog>
    </div>
  );
}
