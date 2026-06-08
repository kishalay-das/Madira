"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "nocturne-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Inline script string — injected in <head> before paint so the correct
 * theme class is applied to <html> with no flash of the wrong theme.
 * Order of preference: saved choice → system preference → dark (brand default).
 */
export const themeInitScript = `
(function(){try{
  var t=localStorage.getItem('${STORAGE_KEY}');
  if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
  var r=document.documentElement;
  r.classList.remove('light','dark');
  r.classList.add(t);
  r.style.colorScheme=t;
}catch(e){document.documentElement.classList.add('dark');}})();
`;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialised after mount from the class the inline script already set.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // After first paint: sync React state to the class the inline script set,
    // then enable smooth color transitions. Done inside rAF so it never causes
    // a hydration mismatch or a synchronous setState during the effect.
    const id = requestAnimationFrame(() => {
      const current = document.documentElement.classList.contains("light")
        ? "light"
        : "dark";
      setThemeState(current);
      document.documentElement.classList.add("theme-ready");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Keep in sync if the OS preference changes and the user hasn't chosen.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const next: Theme = e.matches ? "light" : "dark";
      applyTheme(next);
      setThemeState(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
    setThemeState(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
