import { LitElement, html } from "lit";
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

export class McTagPicker extends LitElement {
  static properties = {
    options: { attribute: false },
    selectedIds: { attribute: false },
    inputId: { type: String, attribute: "input-id" },
    disabled: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaButtonStyles,
    murgaPanelStyles,
    murgaLabelStyles,
    componentStyles,
  ];

  options: McOption[] = [];

  selectedIds: string[] = [];

  inputId?: string;

  disabled = false;

  open = false;

  #handleTriggerClick() {
    dispatchMcEvent(this, "mc-open-change", { open: !this.open });
  }

  #handleOptionToggle(optionId: string) {
    const nextSelectedIds = toggleSelectedId(normalizeSelectedIds(this.selectedIds), optionId);
    dispatchMcEvent(this, "mc-change", { selectedIds: nextSelectedIds });
  }

  render() {
    const selectedIds = normalizeSelectedIds(this.selectedIds);
    const selectedCount = selectedIds.length;

    return html`
      <div part="field">
        <input id=${ifDefined(this.inputId)} type="hidden" value=${selectedIds.join(",")} />
        <button
          class="trigger"
          part="trigger"
          type="button"
          ?disabled=${this.disabled}
          aria-expanded=${this.open ? "true" : "false"}
          @click=${this.#handleTriggerClick}
        >
          <span>${selectedCount > 0 ? `[${selectedCount} SELECTED]` : "[SELECT TAGS]"}</span>
          <span>${this.open ? "[OPEN]" : "[CLOSED]"}</span>
        </button>
        ${
          this.open
            ? html`
              <div class="panel" part="panel">
                ${repeat(
                  this.options,
                  (option) => option.id,
                  (option) => html`
                    <label class="option" part="option">
                      <input
                        type="checkbox"
                        value=${option.id}
                        ?checked=${selectedIds.includes(option.id)}
                        ?disabled=${this.disabled || Boolean(option.disabled)}
                        @change=${() => this.#handleOptionToggle(option.id)}
                      />
                      <span>${option.label}</span>
                    </label>
                  `,
                )}
              </div>
            `
            : null
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
