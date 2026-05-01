import { LitElement, type PropertyValues, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McOption } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { normalizeSelectedIds, toggleSelectedId } from "../../internal/selection";
import {
  murgaButtonStyles,
  murgaLabelStyles,
  murgaPanelStyles,
  murgaThemeStyles,
} from "../../internal/styles";

export const MC_TAG_PICKER_TAG_NAME = "mc-tag-picker";
export const TAG_NAME = MC_TAG_PICKER_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_TAG_PICKER_TAG_NAME)
export class McTagPicker extends LitElement {
  static styles = [
    murgaThemeStyles,
    murgaButtonStyles,
    murgaPanelStyles,
    murgaLabelStyles,
    componentStyles,
  ];

  @property({ attribute: false })
  options: McOption[] = [];

  @property({ attribute: false })
  selectedIds: string[] = [];

  @property({ type: String, attribute: "input-id" })
  inputId?: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  open = false;

  @state()
  private normalizedSelectedIds: string[] = [];

  @state()
  private selectedCount = 0;

  readonly #listboxId = `mc-tag-picker-listbox-${Math.random().toString(36).slice(2)}`;

  protected willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("selectedIds")) {
      this.normalizedSelectedIds = normalizeSelectedIds(this.selectedIds);
      this.selectedCount = this.normalizedSelectedIds.length;
    }
  }

  #handleTriggerClick() {
    dispatchMcEvent(this, "mc-open-change", { open: !this.open });
  }

  #handleOptionToggle(optionId: string) {
    const nextSelectedIds = toggleSelectedId(this.normalizedSelectedIds, optionId);
    dispatchMcEvent(this, "mc-change", { selectedIds: nextSelectedIds });
  }

  render() {
    return html`
      <div part="field">
        <input id=${ifDefined(this.inputId)} type="hidden" value=${this.normalizedSelectedIds.join(",")} />
        <button
          class="trigger"
          part="trigger"
          type="button"
          ?disabled=${this.disabled}
          aria-controls=${this.#listboxId}
          aria-expanded=${this.open ? "true" : "false"}
          aria-haspopup="listbox"
          @click=${this.#handleTriggerClick}
        >
          <span>${this.selectedCount > 0 ? `[${this.selectedCount} SELECTED]` : "[SELECT TAGS]"}</span>
          <span>${this.open ? "[OPEN]" : "[CLOSED]"}</span>
        </button>
        ${
          this.open
            ? html`
              <div
                id=${this.#listboxId}
                class="panel"
                part="panel"
                role="listbox"
                aria-multiselectable="true"
              >
                ${repeat(
                  this.options,
                  (option) => option.id,
                  (option) => html`
                    <label
                      class="option"
                      part="option"
                      role="option"
                      aria-selected=${this.normalizedSelectedIds.includes(option.id) ? "true" : "false"}
                    >
                      <input
                        type="checkbox"
                        value=${option.id}
                        tabindex="-1"
                        ?checked=${this.normalizedSelectedIds.includes(option.id)}
                        ?disabled=${this.disabled || Boolean(option.disabled)}
                        @change=${() => this.#handleOptionToggle(option.id)}
                      />
                      <span>${option.label}</span>
                    </label>
                  `,
                )}
              </div>
            `
            : nothing
        }
      </div>
    `;
  }
}

export function defineMcTagPicker() {
  if (!customElements.get(MC_TAG_PICKER_TAG_NAME)) {
    customElements.define(MC_TAG_PICKER_TAG_NAME, McTagPicker);
  }
}

export type McTagPickerArgs = Partial<
  Pick<McTagPicker, "options" | "selectedIds" | "inputId" | "disabled" | "open">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-tag-picker": McTagPicker;
  }
}
