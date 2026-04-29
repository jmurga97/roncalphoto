import type { StateCreator } from "zustand";
import type { AppStore } from "../store";

export interface SidebarSliceState {
  isAboutOpen: boolean;
  isSidebarOpenDesktop: boolean;
  isSidebarOpenMobile: boolean;
}

export interface SidebarSliceActions {
  resetMobileSidebarState: () => void;
  setAboutOpen: (isOpen: boolean) => void;
  setSidebarOpenDesktop: (isOpen: boolean) => void;
  setSidebarOpenMobile: (isOpen: boolean) => void;
}

export type SidebarSlice = SidebarSliceState & SidebarSliceActions;

type StoreSlice<T> = StateCreator<AppStore, [["zustand/persist", unknown]], [], T>;

export const createSidebarSlice: StoreSlice<SidebarSlice> = (set, get) => ({
  isAboutOpen: false,
  isSidebarOpenDesktop: true,
  isSidebarOpenMobile: false,
  setAboutOpen: (isOpen) => {
    if (get().isAboutOpen === isOpen) {
      return;
    }

    set({ isAboutOpen: isOpen });
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
