import { MOBILE_MEDIA_QUERY } from "@utils/media-queries";
import { useMediaQuery } from "@utils/use-media-query";
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  type SidebarSlice,
  type SidebarSliceActions,
  type SidebarSliceState,
  createSidebarSlice,
} from "./slices/sidebar-slice";
import {
  type Theme,
  type ThemeSlice,
  type ThemeSliceActions,
  createThemeSlice,
} from "./slices/theme-slice";

const LAYOUT_UI_STORAGE_KEY = "roncal-layout-ui";

export type AppStore = SidebarSlice & ThemeSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createSidebarSlice(...args),
      ...createThemeSlice(...args),
    }),
    {
      name: LAYOUT_UI_STORAGE_KEY,
      partialize: (state) => ({
        isSidebarOpenDesktop: state.isSidebarOpenDesktop,
        theme: state.theme,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useSidebarMobile() {
  return useMediaQuery(MOBILE_MEDIA_QUERY);
}

export function useSidebarOpen() {
  const isMobile = useSidebarMobile();
  const { isSidebarOpenDesktop, isSidebarOpenMobile } = useAppStore(
    useShallow((state) => ({
      isSidebarOpenDesktop: state.isSidebarOpenDesktop,
      isSidebarOpenMobile: state.isSidebarOpenMobile,
    })),
  );

  return isMobile ? isSidebarOpenMobile : isSidebarOpenDesktop;
}

export function useTheme() {
  return useAppStore((state) => state.theme);
}

export function useSidebarActions() {
  const isMobile = useSidebarMobile();
  const {
    isSidebarOpenDesktop,
    isSidebarOpenMobile,
    resetMobileSidebarState,
    setSidebarOpenDesktop,
    setSidebarOpenMobile,
  } = useAppStore(
    useShallow((state) => ({
      isSidebarOpenDesktop: state.isSidebarOpenDesktop,
      isSidebarOpenMobile: state.isSidebarOpenMobile,
      resetMobileSidebarState: state.resetMobileSidebarState,
      setSidebarOpenDesktop: state.setSidebarOpenDesktop,
      setSidebarOpenMobile: state.setSidebarOpenMobile,
    })),
  );

  return useMemo(
    () => ({
      closeSidebar: () => {
        if (isMobile) {
          setSidebarOpenMobile(false);
          return;
        }

        setSidebarOpenDesktop(false);
      },
      openSidebar: () => {
        if (isMobile) {
          setSidebarOpenMobile(true);
          return;
        }

        setSidebarOpenDesktop(true);
      },
      resetMobileSidebarState,
      toggleSidebar: () => {
        if (isMobile) {
          setSidebarOpenMobile(!isSidebarOpenMobile);
          return;
        }

        setSidebarOpenDesktop(!isSidebarOpenDesktop);
      },
    }),
    [
      isMobile,
      isSidebarOpenDesktop,
      isSidebarOpenMobile,
      resetMobileSidebarState,
      setSidebarOpenDesktop,
      setSidebarOpenMobile,
    ],
  );
}

export function useThemeActions() {
  return useAppStore(
    useShallow((state) => ({
      setTheme: state.setTheme,
      toggleTheme: state.toggleTheme,
    })),
  );
}

export type { SidebarSliceActions, SidebarSliceState, Theme, ThemeSliceActions };
