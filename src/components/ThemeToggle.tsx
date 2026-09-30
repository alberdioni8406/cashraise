"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeId = "green" | "orange";
const KEY = "cashraise-theme";

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeId>("green");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as ThemeId | null;
      const next: ThemeId =
        stored === "orange" || stored === "green" ? stored : "green";
      applyTheme(next);
      setTheme(next);
    } catch {
      applyTheme("green");
      setTheme("green");
    }
    setReady(true);
  }, []);

  const choose = useCallback((next: ThemeId) => {
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <span className="cr-meta">Theme</span>
      <div className="theme-toggle" role="group" aria-label="Interface theme">
        <button
          type="button"
          aria-pressed={ready ? theme === "green" : undefined}
          onClick={() => choose("green")}
        >
          Cypherpunk
        </button>
        <button
          type="button"
          aria-pressed={ready ? theme === "orange" : undefined}
          onClick={() => choose("orange")}
        >
          BCH Orange
        </button>
      </div>
    </div>
  );
}
