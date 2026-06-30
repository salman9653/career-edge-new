"use client";

import { useTheme } from "next-themes";

/**
 * A drop-in replacement for next-themes' useTheme that additionally
 * persists the selected mode to MongoDB via /api/preferences.
 * Use this everywhere a theme mode toggle exists.
 */
export function useThemeSync() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

  const setThemeAndSync = (mode: string) => {
    setTheme(mode);
    fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeMode: mode }),
    }).catch((err) => {
      console.error("Failed to sync theme mode to DB:", err);
    });
  };

  return { theme, setTheme: setThemeAndSync, resolvedTheme, systemTheme };
}
