import type { ReactNode, RefObject } from "react";

interface AboutPanelShellProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  panelId: string;
  panelRef: RefObject<HTMLDivElement | null>;
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
          "absolute inset-0 bg-[color:color-mix(in_srgb,var(--color-bg)_42%,transparent)] transition-[opacity,backdrop-filter] duration-[520ms] ease-out motion-reduce:transition-none",
          isOpen ? "opacity-100 backdrop-blur-[10px]" : "opacity-0 backdrop-blur-[0px]",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      />

      <div
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        className={[
          "fixed inset-0 m-0 flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden border-0 border-t border-t-[var(--color-border)] rounded-t-[1.5rem] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface)_94%,transparent)_0%,color-mix(in_srgb,var(--color-surface-2)_38%,var(--color-surface))_100%)] opacity-0 shadow-[0_-22px_54px_rgba(20,16,13,0.16)] transition-[transform,opacity] duration-[760ms] ease-[cubic-bezier(0.2,1,0.22,1)] will-change-[transform,opacity] motion-reduce:transition-none",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        id={panelId}
        ref={panelRef}
      >
        <div className="flex justify-center border-b px-4 py-3 ui-divider sm:px-6 sm:py-4">
          <button
            aria-label="Cerrar Sobre nosotros"
            className="inline-flex min-w-14 items-center justify-center rounded-full border bg-[color:color-mix(in_srgb,var(--color-surface)_72%,transparent)] px-4 py-2 ui-divider ui-link"
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
      </div>
    </div>
  );
}
