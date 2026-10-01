import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { THEME_OPTIONS } from "@/config/constants.js";

const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("nse-theme") || "system",
  );
  useEffect(() => {
    localStorage.setItem("nse-theme", theme);
    const dark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme]);
  useEffect(() => {
    if (theme !== "system") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () =>
      document.documentElement.classList.toggle("dark", media.matches);
    media.addEventListener?.("change", handler);
    return () => media.removeEventListener?.("change", handler);
  }, [theme]);
  const value = useMemo(
    () => ({ theme, setTheme, options: THEME_OPTIONS }),
    [theme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}
