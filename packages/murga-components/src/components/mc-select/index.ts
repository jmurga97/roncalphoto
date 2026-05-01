import { LitElement, html, nothing } from "lit";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import { syncAriaAttributes, syncAttribute } from "../../internal/attributes";
import type { McOption } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { findItemById } from "../../internal/selection";
import {
  murgaButtonStyles,
  murgaMetaStyles,
  murgaPanelStyles,
  murgaThemeStyles,
} from "../../internal/styles";

const SELECT_LISTBOX_PREFIX = "mc-select-listbox";
let selectListboxCount = 0;

export const MC_SELECT_TAG_NAME = "mc-select";
export const TAG_NAME = MC_SELECT_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McSelect extends LitElement {
  static properties = {
    options: { attribute: false },
    selectedId: { type: String, attribute: "selected-id" },
    inputId: { type: String, attribute: "input-id" },
    name: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    ariaLabel: { type: String, attribute: "aria-label" },
  };

  static styles = [
    murgaThemeStyles,
    murgaButtonStyles,
    murgaPanelStyles,
    murgaMetaStyles,
    componentStyles,
  ];

  options: McOption[] = [];

  selectedId: string | null = null;

  inputId?: string;

  name?: string;

  placeholder = "[SELECT]";

  disabled = false;

  open = false;

  ariaLabel: string | null = null;

  readonly #listboxId = `${SELECT_LISTBOX_PREFIX}-${++selectListboxCount}`;

  updated(changedProperties: Map<string, unknown>) {
    const triggerElement = this.#getTrigger();

    if (!triggerElement) {
      return;
    }

    syncAriaAttributes(this, triggerElement);
    syncAttribute(triggerElement, "aria-label", this.ariaLabel);

    if (changedProperties.has("open") && this.open) {
      queueMicrotask(() => {
        const selectedOption = this.renderRoot.querySelector<HTMLButtonElement>(
          '.option[aria-selected="true"]',
        );
        selectedOption?.focus();
      });
    }
  }

  #getTrigger() {
    return this.renderRoot.querySelector<HTMLButtonElement>(".trigger");
  }

  #handleTriggerClick() {
    dispatchMcEvent(this, "mc-open-change", { open: !this.open });
  }

  #handleTriggerKeyDown(event: KeyboardEvent) {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "Spacebar"
    ) {
      event.preventDefault();
      dispatchMcEvent(this, "mc-open-change", { open: true });
    }
  }

  #handlePanelKeyDown(event: KeyboardEvent) {
    const optionElements = Array.from(
      this.renderRoot.querySelectorAll<HTMLButtonElement>(".option"),
    );

    if (event.key === "Escape") {
      event.preventDefault();
      dispatchMcEvent(this, "mc-open-change", { open: false });
      this.#getTrigger()?.focus();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    const activeElement = this.shadowRoot?.activeElement ?? null;
    const currentIndex = optionElements.findIndex((element) => element === activeElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      currentIndex === -1
        ? 0
        : Math.max(0, Math.min(optionElements.length - 1, currentIndex + delta));
    optionElements[nextIndex]?.focus();
  }

  #handleOptionClick(option: McOption) {
    dispatchMcEvent(this, "mc-change", { selectedId: option.id });
    dispatchMcEvent(this, "mc-open-change", { open: false });
  }

  render() {
    const selectedOption = findItemById(this.options, this.selectedId);
    const displayLabel = selectedOption?.label ?? this.placeholder;

    return html`
      <div class="field" part="field">
        <input
          type="hidden"
          id=${ifDefined(this.inputId)}
          name=${ifDefined(this.name)}
          value=${ifDefined(this.selectedId ?? undefined)}
        />
        <button
          class="trigger"
          part="trigger"
          type="button"
          ?disabled=${this.disabled}
          aria-controls=${this.#listboxId}
          aria-expanded=${this.open ? "true" : "false"}
          aria-haspopup="listbox"
          @click=${this.#handleTriggerClick}
          @keydown=${this.#handleTriggerKeyDown}
        >
          <span class=${selectedOption ? "value" : "value placeholder"}>${displayLabel}</span>
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
                @keydown=${this.#handlePanelKeyDown}
              >
                ${repeat(
                  this.options,
                  (option) => option.id,
                  (option) => html`
                    <button
                      class="option"
                      part="option"
                      type="button"
                      role="option"
                      aria-selected=${this.selectedId === option.id ? "true" : "false"}
                      ?disabled=${option.disabled}
                      @click=${() => this.#handleOptionClick(option)}
                    >
                      <span>${option.label}</span>
                      ${
                        option.description
                          ? html`<span class="description">${option.description}</span>`
                          : nothing
                      }
                    </button>
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

export function defineMcSelect() {
  if (!customElements.get(MC_SELECT_TAG_NAME)) {
    customElements.define(MC_SELECT_TAG_NAME, McSelect);
  }
}

export type McSelectArgs = Partial<
  Pick<
    McSelect,
    | "options"
    | "selectedId"
    | "inputId"
    | "name"
    | "placeholder"
    | "disabled"
    | "open"
    | "ariaLabel"
  >
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-select": McSelect;
  }
}
