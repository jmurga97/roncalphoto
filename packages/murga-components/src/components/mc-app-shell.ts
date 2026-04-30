import { LitElement, css, html } from "lit";

import { dispatchMcEvent } from "../internal/events";
import { createFocusTrap } from "../internal/focus";
import { murgaPanelStyles, murgaThemeStyles } from "../internal/styles";

export const MC_APP_SHELL_TAG_NAME = "mc-app-shell";
export const TAG_NAME = MC_APP_SHELL_TAG_NAME;

export class McAppShell extends LitElement {
  static properties = {
    sidebarOpen: { type: Boolean, attribute: "sidebar-open", reflect: true },
    mobileOverlay: { type: Boolean, attribute: "mobile-overlay", reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaPanelStyles,
    css`
      :host {
        block-size: 100%;
      }

      .root {
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        min-block-size: 100dvh;
        background: var(--black);
      }

      .sidebar {
        position: fixed;
        inset-block: 0;
        inset-inline-start: 0;
        z-index: 20;
        inline-size: min(320px, 90vw);
        padding: var(--space-md);
        transform: translateX(-100%);
        transition: transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
        background: var(--surface);
        border-inline-end: 1px solid var(--border-visible);
      }

      :host([sidebar-open]) .sidebar {
        transform: translateX(0);
      }

      .overlay {
        position: fixed;
        inset: 0;
        z-index: 10;
        border: 0;
        background: rgba(0, 0, 0, 0.8);
      }

      .main {
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-block-size: 100dvh;
      }

      @media (min-width: 960px) {
        .root {
          grid-template-columns: 320px 1fr;
        }

        .sidebar {
          position: sticky;
          transform: none;
          inline-size: 320px;
          z-index: auto;
        }

        .overlay {
          display: none;
        }
      }
    `,
  ];

  sidebarOpen = false;

  mobileOverlay = true;

  #releaseFocusTrap: (() => void) | null = null;

  disconnectedCallback() {
    this.#releaseFocusTrap?.();
    this.#releaseFocusTrap = null;
    super.disconnectedCallback();
  }

  updated() {
    this.#syncFocusTrap();
  }

  #syncFocusTrap() {
    this.#releaseFocusTrap?.();
    this.#releaseFocusTrap = null;

    if (!this.mobileOverlay || !this.sidebarOpen) {
      return;
    }

    const sidebarElement = this.renderRoot.querySelector<HTMLElement>(".sidebar");

    if (!sidebarElement) {
      return;
    }

    this.#releaseFocusTrap = createFocusTrap(sidebarElement, {
      onEscape: () => {
        dispatchMcEvent(this, "mc-sidebar-open-change", { open: false });
      },
    });
  }

  #handleOverlayClick() {
    dispatchMcEvent(this, "mc-sidebar-open-change", { open: false });
  }

  render() {
    const showOverlay = this.mobileOverlay && this.sidebarOpen;

    return html`
      <div class="root" part="root">
        ${
          showOverlay
            ? html`
              <button
                class="overlay"
                part="overlay"
                type="button"
                aria-label="Close sidebar"
                @click=${this.#handleOverlayClick}
              ></button>
            `
            : null
        }
        <aside class="sidebar" part="sidebar">
          <slot name="sidebar"></slot>
        </aside>
        <main class="main" part="main">
          <slot name="header"></slot>
          <slot name="main"></slot>
          <slot name="footer"></slot>
        </main>
      </div>
    `;
  }
}

export function defineMcAppShell() {
  if (!customElements.get(MC_APP_SHELL_TAG_NAME)) {
    customElements.define(MC_APP_SHELL_TAG_NAME, McAppShell);
  }
}

export type McAppShellArgs = Partial<Pick<McAppShell, "sidebarOpen" | "mobileOverlay">>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-app-shell": McAppShell;
  }
}
