import { useEffect, useRef } from "react";

import { SidebarToggleIcon } from "@components/sidebar/components/sidebar-toggle-icon";
import { prefersReducedMotion } from "@utils/prefers-reduced-motion";

import { StudioContent } from "./studio-content";
import { STUDIO_SECTIONS } from "./studio-sections";

import type { StudioSection } from "./studio-sections";
import type { RefObject } from "react";

interface StudioPanelProps {
  isOpen: boolean;
  section: StudioSection;
  onClose: () => void;
  onSectionChange: (section: StudioSection) => void;
  sidebarRef: RefObject<HTMLElement | null>;
}

export function StudioPanel({ isOpen, section, onClose, onSectionChange, sidebarRef }: StudioPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) pageRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [section, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const background = backgroundRef.current;
    const content = contentRef.current;
    const sidebar = sidebarRef.current;
    if (!dialog || !background || !content || !sidebar || (!isOpen && !dialog.open)) return;

    const isFreshOpen = isOpen && !dialog.open;
    const currentTransform = getComputedStyle(dialog).transform;
    const currentBackgroundOpacity = Number(getComputedStyle(background).opacity);
    const currentContentOpacity = Number(getComputedStyle(content).opacity);
    // Cleanup has canceled our previous animations; measure the full, untransformed destination.
    dialog.style.transform = "none";
    if (isFreshOpen) {
      dialog.showModal();
    }

    const origin = sidebar.getBoundingClientRect();
    const target = dialog.getBoundingClientRect();
    const collapsed = `translate(${origin.left - target.left}px, ${origin.top - target.top}px) scale(${origin.width / target.width}, ${origin.height / target.height})`;
    const expanded = "translate(0px, 0px) scale(1, 1)";
    const reducedMotion = prefersReducedMotion();
    const duration = reducedMotion ? 0 : 280;
    const delay = !isOpen && !reducedMotion && currentContentOpacity > 0 ? 160 : 0;
    const styles = getComputedStyle(dialog);
    const easing = styles.getPropertyValue("--ease-out").trim();
    const glassOpacity = Number(styles.getPropertyValue("--glass-opacity"));
    const studioOpacity = Number(styles.getPropertyValue("--studio-surface-opacity"));
    const restingTransform = isFreshOpen ? collapsed : currentTransform;
    const initialTransform = reducedMotion ? expanded : restingTransform;
    const targetTransform = isOpen || reducedMotion ? expanded : collapsed;
    const morph = dialog.animate(
      { transform: [initialTransform, targetTransform] },
      { duration, delay, easing, fill: "both" },
    );
    const startingBackgroundOpacity = isFreshOpen ? glassOpacity : currentBackgroundOpacity;
    const fill = background.animate(
      {
        opacity: [
          reducedMotion ? studioOpacity : startingBackgroundOpacity,
          isOpen || reducedMotion ? studioOpacity : glassOpacity,
        ],
      },
      { duration, delay, easing, fill: "both" },
    );
    const reveal = content.animate(
      { opacity: isOpen ? [0, 1] : [currentContentOpacity, 0] },
      { duration: 160, delay: isOpen ? duration : 0, easing, fill: "both" },
    );

    void Promise.all([morph.finished, fill.finished, reveal.finished])
      .then(() => {
        if (!isOpen) dialog.close();
      })
      .catch(() => {
        /* An interrupted transition continues from its current shape. */
      });

    return () => {
      // Preserve the current frame when the visitor reverses the transition.
      dialog.style.transform = getComputedStyle(dialog).transform;
      background.style.opacity = getComputedStyle(background).opacity;
      content.style.opacity = getComputedStyle(content).opacity;
      morph.cancel();
      fill.cancel();
      reveal.cancel();
    };
  }, [isOpen, sidebarRef]);

  function changeSection(nextSection: StudioSection) {
    if (nextSection === section) return;
    onSectionChange(nextSection);
  }

  return (
    <dialog
      aria-labelledby={`${section}-title`}
      className="studio-panel glass"
      id="estudio"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      ref={dialogRef}
    >
      <div aria-hidden="true" className="studio-panel-background" ref={backgroundRef} />
      <div className="studio-panel-content" ref={contentRef}>
        <div className="studio-panel-header">
          <nav aria-label="Secciones del estudio" className="studio-panel-nav">
            {STUDIO_SECTIONS.map(({ id, label }) => (
              <button
                aria-current={section === id ? "page" : undefined}
                className="ui-link min-h-11"
                key={id}
                onClick={() => changeSection(id)}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            aria-label="Cerrar información"
            className="ui-link glass flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            onClick={onClose}
            title="Cerrar"
            type="button"
          >
            <SidebarToggleIcon isOpen />
          </button>
        </div>
        <div className="studio-panel-page" ref={pageRef}>
          <StudioContent key={section} section={section} />
        </div>
      </div>
    </dialog>
  );
}
