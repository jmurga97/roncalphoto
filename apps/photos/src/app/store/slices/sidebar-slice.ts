import type { AppStore } from "../store";
import type { StateCreator } from "zustand";

export interface SidebarSliceState {
  highlightedSessionSlug?: string;
  isSidebarOpenDesktop: boolean;
  isSidebarOpenMobile: boolean;
}

export interface SidebarSliceActions {
  resetMobileSidebarState: () => void;
  setHighlightedSessionSlug: (slug?: string) => void;
  setSidebarOpenDesktop: (isOpen: boolean) => void;
  setSidebarOpenMobile: (isOpen: boolean) => void;
}

export type SidebarSlice = SidebarSliceState & SidebarSliceActions;

type StoreSlice<T> = StateCreator<AppStore, [["zustand/persist", unknown]], [], T>;

export const createSidebarSlice: StoreSlice<SidebarSlice> = (set, get) => ({
  isSidebarOpenDesktop: true,
  isSidebarOpenMobile: false,
  setHighlightedSessionSlug: (slug) => {
    if (get().highlightedSessionSlug === slug) {
      return;
    }

    set({ highlightedSessionSlug: slug });
  },
  resetMobileSidebarState: () => {
    if (!get().isSidebarOpenMobile) {
      return;
    }

    set({ isSidebarOpenMobile: false });
  },
  setSidebarOpenDesktop: (isOpen) => {
    if (get().isSidebarOpenDesktop === isOpen) {
      return;
    }

    set({ isSidebarOpenDesktop: isOpen });
  },
  setSidebarOpenMobile: (isOpen) => {
    if (get().isSidebarOpenMobile === isOpen) {
      return;
    }

    set({ isSidebarOpenMobile: isOpen });
  },
});
