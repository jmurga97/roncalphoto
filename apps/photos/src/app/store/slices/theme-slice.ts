import type { StateCreator } from "zustand";
import type { AppStore } from "../store";

export type Theme = "dark" | "light";

function resolveInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    const documentTheme = document.documentElement.dataset.theme;

    if (documentTheme === "dark" || documentTheme === "light") {
      return documentTheme;
    }
  }

  return "light";
}

export interface ThemeSliceState {
  theme: Theme;
}

export interface ThemeSliceActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export type ThemeSlice = ThemeSliceState & ThemeSliceActions;

type StoreSlice<T> = StateCreator<AppStore, [["zustand/persist", unknown]], [], T>;

export const createThemeSlice: StoreSlice<ThemeSlice> = (set) => ({
  theme: resolveInitialTheme(),
  setTheme: (theme) => {
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    }));
  },
});
