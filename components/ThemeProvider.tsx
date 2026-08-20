"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ColorScheme = "light" | "dark";

interface ThemeContextValue {
  theme: ColorScheme;
  setTheme: (theme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ColorScheme;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<ColorScheme>(initialTheme);

  useEffect(() => {
    setThemeState(initialTheme);
  }, [initialTheme]);

  function setTheme(novoTema: ColorScheme) {
    document.documentElement.classList.toggle("light", novoTema === "light");
    setThemeState(novoTema);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}
