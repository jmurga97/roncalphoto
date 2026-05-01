import { css } from "lit";

export const murgaThemeStyles = css`
  :host {
    --black: #000000;
    --surface: #111111;
    --surface-raised: #1a1a1a;
    --border: #222222;
    --border-visible: #333333;
    --text-disabled: #666666;
    --text-secondary: #999999;
    --text-primary: #e8e8e8;
    --text-display: #ffffff;
    --accent: #d71921;
    --accent-subtle: rgba(215, 25, 33, 0.15);
    --success: #4a9e5c;
    --warning: #d4a843;
    --error: #d71921;
    --info: #999999;
    --interactive: #5b9bf6;
    --display-xl: 4.5rem;
    --display-lg: 3rem;
    --display-md: 2.25rem;
    --heading: 1.5rem;
    --subheading: 1.125rem;
    --body: 1rem;
    --body-sm: 0.875rem;
    --caption: 0.75rem;
    --label: 0.6875rem;
    --space-2xs: 2px;
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;
    --space-3xl: 64px;
    --space-4xl: 96px;
    display: block;
    color-scheme: dark;
    color: var(--text-primary);
    font-family: "Space Grotesk", "DM Sans", system-ui, sans-serif;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  [hidden] {
    display: none !important;
  }

  :where(button, input, textarea, select) {
    font: inherit;
    color: inherit;
  }

  :where(button, input, textarea, select, [tabindex]):focus-visible {
    outline: 2px solid var(--text-display);
    outline-offset: 3px;
  }
`;

export const murgaLabelStyles = css`
  font-family: "Space Mono", "JetBrains Mono", "SF Mono", monospace;
  font-size: var(--label);
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
`;

export const murgaMetaStyles = css`
  font-family: "Space Mono", "JetBrains Mono", "SF Mono", monospace;
  font-size: var(--caption);
  letter-spacing: 0.04em;
  line-height: 1.4;
`;

export const murgaButtonStyles = css`
  button {
    border: 1px solid var(--border-visible);
    border-radius: 999px;
    min-block-size: 44px;
    padding: 12px 24px;
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    font-family: "Space Mono", "JetBrains Mono", "SF Mono", monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    line-height: 1.2;
    text-transform: uppercase;
    transition:
      border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1),
      color 200ms cubic-bezier(0.25, 0.1, 0.25, 1),
      background-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1),
      opacity 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  button:hover:not([disabled]) {
    border-color: var(--text-display);
    color: var(--text-display);
  }

  button[disabled] {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const murgaInputSurfaceStyles = css`
  :where(input, textarea, select) {
    border: 1px solid var(--border-visible);
    border-radius: 8px;
    background: transparent;
    min-block-size: 44px;
    inline-size: 100%;
    padding: 12px 16px;
    color: var(--text-primary);
    font-family: "Space Mono", "JetBrains Mono", "SF Mono", monospace;
    transition:
      border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1),
      color 200ms cubic-bezier(0.25, 0.1, 0.25, 1),
      opacity 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  :where(input, textarea, select):hover:not([disabled]) {
    border-color: var(--text-secondary);
  }

  :where(input, textarea, select):focus {
    border-color: var(--text-display);
    outline: none;
  }

  :where(input, textarea, select)::placeholder {
    color: var(--text-disabled);
  }
`;

export const murgaPanelStyles = css`
  :host {
    background: var(--surface-raised);
    border: 1px solid var(--border-visible);
    border-radius: 12px;
  }
`;

export const murgaSurfaceStyles = css`
  :host {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
  }
`;
