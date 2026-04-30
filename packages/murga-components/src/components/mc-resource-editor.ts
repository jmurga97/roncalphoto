import { LitElement, css, html, nothing } from "lit";

import type { McInlineStatus } from "../internal/contracts";
import { dispatchMcEvent } from "../internal/events";
import {
  murgaButtonStyles,
  murgaMetaStyles,
  murgaSurfaceStyles,
  murgaThemeStyles,
} from "../internal/styles";

export const MC_RESOURCE_EDITOR_TAG_NAME = "mc-resource-editor";
export const TAG_NAME = MC_RESOURCE_EDITOR_TAG_NAME;

export class McResourceEditor extends LitElement {
  static properties = {
    resourceTitle: { type: String, attribute: "resource-title" },
    status: { attribute: false },
    dirty: { type: Boolean, reflect: true },
    saving: { type: Boolean, reflect: true },
    deleting: { type: Boolean, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaSurfaceStyles,
    murgaMetaStyles,
    murgaButtonStyles,
    css`
      .root {
        display: grid;
        gap: var(--space-lg);
        padding: var(--space-lg);
      }

      .layout {
        display: grid;
        gap: var(--space-lg);
      }

      .body {
        display: grid;
        gap: var(--space-md);
      }

      .footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
      }

      .aside {
        border-top: 1px solid var(--border);
        padding-top: var(--space-md);
      }

      @media (min-width: 960px) {
        .layout {
          grid-template-columns: minmax(0, 1fr) 280px;
        }

        .aside {
          border-top: 0;
          border-inline-start: 1px solid var(--border);
          padding-top: 0;
          padding-inline-start: var(--space-lg);
        }
      }
    `,
  ];

  resourceTitle = "";

  status: McInlineStatus | null = null;

  dirty = false;

  saving = false;

  deleting = false;

  #handleAction(action: "save" | "cancel" | "delete") {
    const eventName =
      action === "save" ? "mc-save" : action === "cancel" ? "mc-cancel" : "mc-delete";
    dispatchMcEvent(this, eventName, { action });
  }

  render() {
    return html`
      <section class="root" part="root">
        <header part="header">
          <div>${this.resourceTitle}</div>
          ${this.status ? html`<div>${this.status.label}</div>` : this.dirty ? html`<div>[DIRTY]</div>` : nothing}
        </header>

        <div class="layout">
          <div class="body" part="body">
            <slot name="fields"></slot>
          </div>
          <aside class="aside" part="aside">
            <slot name="aside"></slot>
          </aside>
        </div>

        <footer class="footer" part="footer">
          <slot name="actions"></slot>
          <button type="button" ?disabled=${this.saving || this.deleting} @click=${() => this.#handleAction("save")}>
            ${this.saving ? "[LOADING]" : "[SAVE]"}
          </button>
          <button type="button" ?disabled=${this.saving || this.deleting} @click=${() => this.#handleAction("cancel")}>
            [CANCEL]
          </button>
          <button type="button" ?disabled=${this.saving || this.deleting} @click=${() => this.#handleAction("delete")}>
            ${this.deleting ? "[LOADING]" : "[DELETE]"}
          </button>
        </footer>
      </section>
    `;
  }
}

export function defineMcResourceEditor() {
  if (!customElements.get(MC_RESOURCE_EDITOR_TAG_NAME)) {
    customElements.define(MC_RESOURCE_EDITOR_TAG_NAME, McResourceEditor);
  }
}

export type McResourceEditorArgs = Partial<
  Pick<McResourceEditor, "resourceTitle" | "status" | "dirty" | "saving" | "deleting">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-resource-editor": McResourceEditor;
  }
}
