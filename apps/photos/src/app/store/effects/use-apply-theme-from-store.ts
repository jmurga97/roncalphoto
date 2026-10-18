import { useEffect, useLayoutEffect } from "react";

import { isEditableTarget } from "@utils/is-editable-target";
import { useMediaQuery } from "@utils/use-media-query";

import { useTheme, useThemeActions } from "../store";

import type { Theme } from "../slices/theme-slice";

const SHORTCUT_THEMES: Record<string, Theme> = { "1": "light", "2": "dark" };

/**
 * Applies the explicit theme, else the system one, and listens for
 * Cmd/Ctrl+1 (light) and Cmd/Ctrl+2 (dark).
 */
export function useApplyThemeFromStore() {
  const theme = useTheme();
  const { setTheme } = useThemeActions();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedTheme = theme ?? (prefersDark ? "dark" : "light");

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    // Status bar / browser chrome follows the page background, not the OS scheme.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", getComputedStyle(root).getPropertyValue("--color-bg").trim());
  }, [resolvedTheme]);

  useEffect(() => {
    const onDocumentKeydown = (event: KeyboardEvent) => {
      const shortcutTheme = SHORTCUT_THEMES[event.key];

      if (!shortcutTheme || !(event.metaKey || event.ctrlKey) || isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      setTheme(shortcutTheme);
    };

    document.addEventListener("keydown", onDocumentKeydown);

    return () => {
      document.removeEventListener("keydown", onDocumentKeydown);
    };
  }, [setTheme]);
}
