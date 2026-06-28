"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";

const FONTS = [
  { name: "Plus Jakarta Sans", family: "var(--font-sans)", googleFont: null },
  { name: "Inter", family: "'Inter', sans-serif", googleFont: "Inter" },
  { name: "Outfit", family: "'Outfit', sans-serif", googleFont: "Outfit" },
  { name: "Roboto", family: "'Roboto', sans-serif", googleFont: "Roboto" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif", googleFont: "Space+Grotesk" },
  { name: "Playfair Display", family: "'Playfair Display', serif", googleFont: "Playfair+Display" },
];

function applyFont(fontName: string) {
  const fontConfig = FONTS.find((f) => f.name === fontName) || FONTS[0];
  if (fontConfig.googleFont) {
    const linkId = `google-font-${fontConfig.googleFont}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontConfig.googleFont}:wght@300;400;500;600;700;800&display=swap`;
      document.head.appendChild(link);
    }
  }
  document.documentElement.style.setProperty("--font-sans", fontConfig.family);
}

/**
 * Applies the user's saved theme color and font preferences.
 * Synchronizes browser localStorage cache with MongoDB user preferences.
 * This component should ONLY be rendered inside the dashboard layout
 * so that landing/auth pages always use the fixed default theme (indigo).
 */
export function DashboardThemeApplier() {
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const hasSyncedRef = useRef(false);

  // 1. Instant cache hydration on mount
  useEffect(() => {
    const root = document.documentElement;

    const savedHex = localStorage.getItem("career-edge-theme-color-hex");
    const savedFrom = localStorage.getItem("career-edge-theme-color-from-hex");
    const savedTo = localStorage.getItem("career-edge-theme-color-to-hex");

    if (savedHex) {
      root.style.setProperty("--primary", savedHex);
    }
    if (savedFrom) {
      root.style.setProperty("--primary-gradient-from", savedFrom);
    }
    if (savedTo) {
      root.style.setProperty("--primary-gradient-to", savedTo);
    }

    const savedFontName = localStorage.getItem("career-edge-theme-font") || "Plus Jakarta Sans";
    applyFont(savedFontName);

    // Reset styles to global defaults when leaving the dashboard
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-gradient-from");
      root.style.removeProperty("--primary-gradient-to");
      root.style.removeProperty("--font-sans");
    };
  }, []);

  // 2. Synchronize with MongoDB User Preferences
  useEffect(() => {
    if (!session || !session.user || hasSyncedRef.current) return;

    hasSyncedRef.current = true;

    const root = document.documentElement;

    // Get current local cached values
    const localColor = localStorage.getItem("career-edge-theme-color") || "Indigo";
    const localHex = localStorage.getItem("career-edge-theme-color-hex") || "#6366f1";
    const localFrom = localStorage.getItem("career-edge-theme-color-from-hex") || "#6366f1";
    const localTo = localStorage.getItem("career-edge-theme-color-to-hex") || "#6366f1";
    const localFont = localStorage.getItem("career-edge-theme-font") || "Plus Jakarta Sans";
    const localThemeMode = localStorage.getItem("theme") || "system"; // next-themes key is "theme"

    fetch("/api/preferences")
      .then((res) => res.json())
      .then((data) => {
        const dbPrefs = data.preferences;

        if (dbPrefs) {
          // Case A: DB has values. If they differ from local cache, update local cache and apply them
          const dbColor = dbPrefs.themeColor;
          const dbHex = dbPrefs.themeColorHex;
          const dbFrom = dbPrefs.themeGradientFrom;
          const dbTo = dbPrefs.themeGradientTo;
          const dbFont = dbPrefs.font;
          const dbThemeMode = dbPrefs.themeMode;

          const isColorDifferent = dbColor !== localColor || dbHex !== localHex || dbFrom !== localFrom || dbTo !== localTo;
          const isFontDifferent = dbFont !== localFont;
          const isModeDifferent = dbThemeMode !== localThemeMode;

          if (isColorDifferent || isFontDifferent || isModeDifferent) {
            if (isColorDifferent) {
              localStorage.setItem("career-edge-theme-color", dbColor);
              localStorage.setItem("career-edge-theme-color-hex", dbHex);
              localStorage.setItem("career-edge-theme-color-from-hex", dbFrom || dbHex);
              localStorage.setItem("career-edge-theme-color-to-hex", dbTo || dbHex);

              root.style.setProperty("--primary", dbHex);
              root.style.setProperty("--primary-gradient-from", dbFrom || dbHex);
              root.style.setProperty("--primary-gradient-to", dbTo || dbHex);
            }

            if (isFontDifferent) {
              localStorage.setItem("career-edge-theme-font", dbFont);
              applyFont(dbFont);
            }

            if (isModeDifferent && theme !== dbThemeMode) {
              // next-themes setTheme automatically updates localStorage under the "theme" key
              setTheme(dbThemeMode);
            }
          }
        } else {
          // Case B: DB has no preferences initialized yet. Sync local preferences to DB.
          fetch("/api/preferences", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              themeColor: localColor,
              themeColorHex: localHex,
              themeGradientFrom: localFrom,
              themeGradientTo: localTo,
              font: localFont,
              themeMode: localThemeMode,
            }),
          }).catch((err) => {
            console.error("Failed to sync local preferences to MongoDB:", err);
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch preferences from MongoDB:", err);
      });
  }, [session, theme, setTheme]);

  return null;
}
