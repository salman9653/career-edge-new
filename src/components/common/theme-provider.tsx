"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const savedHex = localStorage.getItem("career-edge-theme-color-hex");
    const savedFrom = localStorage.getItem("career-edge-theme-color-from-hex");
    const savedTo = localStorage.getItem("career-edge-theme-color-to-hex");
    
    if (savedHex) {
      document.documentElement.style.setProperty("--primary", savedHex);
    }
    if (savedFrom) {
      document.documentElement.style.setProperty("--primary-gradient-from", savedFrom);
    }
    if (savedTo) {
      document.documentElement.style.setProperty("--primary-gradient-to", savedTo);
    }

    // Load and apply saved font
    const savedFontName = localStorage.getItem("career-edge-theme-font") || "Plus Jakarta Sans";
    const FONTS = [
      { name: "Plus Jakarta Sans", family: "var(--font-sans)", googleFont: null },
      { name: "Inter", family: "'Inter', sans-serif", googleFont: "Inter" },
      { name: "Outfit", family: "'Outfit', sans-serif", googleFont: "Outfit" },
      { name: "Roboto", family: "'Roboto', sans-serif", googleFont: "Roboto" },
      { name: "Space Grotesk", family: "'Space Grotesk', sans-serif", googleFont: "Space+Grotesk" },
      { name: "Playfair Display", family: "'Playfair Display', serif", googleFont: "Playfair+Display" },
    ];
    
    const fontConfig = FONTS.find((f) => f.name === savedFontName) || FONTS[0];
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
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
