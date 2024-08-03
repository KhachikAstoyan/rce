import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { themeAtom } from "@/store/theme";

type theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  useEffect(() => {
    const localTheme = localStorage.getItem("theme") as theme;

    if (localTheme) {
      setTheme(localTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  return {
    theme,
    setTheme,
    toggle,
  };
};
