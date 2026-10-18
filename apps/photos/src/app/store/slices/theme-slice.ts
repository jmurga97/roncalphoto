import type { AppStore } from "../store";
import type { StateCreator } from "zustand";

export type Theme = "dark" | "light";

export interface ThemeSliceState {
  // Explicit choice from the keyboard shortcuts; undefined follows the system preference.
  theme?: Theme;
}

export interface ThemeSliceActions {
  setTheme: (theme: Theme) => void;
}

export type ThemeSlice = ThemeSliceState & ThemeSliceActions;

type StoreSlice<T> = StateCreator<AppStore, [["zustand/persist", unknown]], [], T>;

export const createThemeSlice: StoreSlice<ThemeSlice> = (set) => ({
  setTheme: (theme) => {
    set({ theme });
  },
});
