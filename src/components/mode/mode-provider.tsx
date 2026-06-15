"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export type Mode = "premium" | "standard";

const COOKIE = "nocturne-mode";

interface ModeContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

/**
 * Inline script — injected in <head> before paint so the correct
 * `data-mode` attribute is on <html> with no flash of the wrong storefront.
 */
export const modeInitScript = `
(function(){try{
  var m=document.cookie.match(/(?:^|; )nocturne-mode=(premium|standard)/);
  document.documentElement.setAttribute('data-mode', m ? m[1] : 'premium');
}catch(e){document.documentElement.setAttribute('data-mode','premium');}})();
`;

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mode, setModeState] = useState<Mode>("premium");

  // Sync React state to the attribute the inline script already set.
  useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-mode") === "standard"
        ? "standard"
        : "premium";
    setModeState(current);
  }, []);

  const setMode = useCallback(
    (m: Mode) => {
      document.cookie = `${COOKIE}=${m}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.setAttribute("data-mode", m);
      setModeState(m);
      // Re-render server components so the catalog matches the new segment.
      router.refresh();
    },
    [router]
  );

  const toggle = useCallback(
    () => setMode(mode === "premium" ? "standard" : "premium"),
    [mode, setMode]
  );

  return (
    <ModeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
