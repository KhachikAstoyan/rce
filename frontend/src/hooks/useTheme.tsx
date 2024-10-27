import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { themeAtom } from "@/store/theme";
import { useMantineColorScheme } from "@mantine/core";

type theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    const localTheme = localStorage.getItem("theme") as theme;

    if (localTheme) {
      setTheme(localTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    setColorScheme(theme);
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
