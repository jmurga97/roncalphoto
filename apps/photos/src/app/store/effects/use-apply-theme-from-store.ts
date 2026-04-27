import { useLayoutEffect } from "react";
import { useTheme } from "../store";

export function useApplyThemeFromStore() {
  const theme = useTheme();

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
