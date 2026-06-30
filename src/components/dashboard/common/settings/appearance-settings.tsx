"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui";
import { useThemeSync } from "@/hooks/useThemeSync";

// Solid Colors definition matching image 1
const SOLID_COLORS = [
  { name: "Aubergine", hex: "#a855f7" },
  { name: "Clementine", hex: "#f97316" },
  { name: "Banana", hex: "#eab308" },
  { name: "Jade", hex: "#14b8a6" },
  { name: "Lagoon", hex: "#06b6d4" },
  { name: "Barbra", hex: "#ec4899" },
  { name: "Verdant", hex: "#22c55e" },
  { name: "Sky", hex: "#3b82f6" },
  { name: "Rose", hex: "#ef4444" },
  { name: "Gray", hex: "#64748b" },
  { name: "Indigo", hex: "#6366f1" },
];

// Fun and New Gradients definition matching image 2
const GRADIENT_COLORS = [
  { name: "Raspberry Beret", from: "#ec4899", to: "#a855f7", hex: "#d946ef" },
  { name: "Big Business", from: "#3b82f6", to: "#6366f1", hex: "#4f46e5" },
  { name: "POG", from: "#f97316", to: "#eab308", hex: "#f59e0b" },
  { name: "Mint Chip", from: "#06b6d4", to: "#22c55e", hex: "#10b981" },
  { name: "PB&J", from: "#8b5cf6", to: "#ef4444", hex: "#a855f7" },
  { name: "Chill Vibes", from: "#14b8a6", to: "#06b6d4", hex: "#06b6d4" },
  { name: "Forest Floor", from: "#15803d", to: "#4ade80", hex: "#22c55e" },
  { name: "Slackr", from: "#4f46e5", to: "#d946ef", hex: "#818cf8" },
  { name: "Sea Glass", from: "#06b6d4", to: "#3b82f6", hex: "#0ea5e9" },
  { name: "Lemon Lime", from: "#84cc16", to: "#22c55e", hex: "#a3e635" },
  { name: "Falling Leaves", from: "#ea580c", to: "#854d0e", hex: "#d97706" },
  { name: "Sunrise", from: "#ef4444", to: "#f97316", hex: "#f97316" },
];

const FONTS = [
  { name: "Plus Jakarta Sans", family: "var(--font-sans)", googleFont: null },
  { name: "Inter", family: "'Inter', sans-serif", googleFont: "Inter" },
  { name: "Outfit", family: "'Outfit', sans-serif", googleFont: "Outfit" },
  { name: "Roboto", family: "'Roboto', sans-serif", googleFont: "Roboto" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif", googleFont: "Space+Grotesk" },
  { name: "Playfair Display", family: "'Playfair Display', serif", googleFont: "Playfair+Display" },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useThemeSync();
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState("Indigo");
  const [selectedFont, setSelectedFont] = useState("Plus Jakarta Sans");

  // Ensure next-themes is mounted to prevent hydration mismatches
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedColor = localStorage.getItem("career-edge-theme-color") || "Indigo";
    const savedFont = localStorage.getItem("career-edge-theme-font") || "Plus Jakarta Sans";
    setSelectedColor(savedColor);
    setSelectedFont(savedFont);
  }, []);

  const handleColorSelect = (colorName: string, hex: string, from?: string, to?: string) => {
    setSelectedColor(colorName);
    localStorage.setItem("career-edge-theme-color", colorName);
    
    const fromHex = from || hex;
    const toHex = to || hex;
    
    document.documentElement.style.setProperty("--primary", hex);
    document.documentElement.style.setProperty("--primary-gradient-from", fromHex);
    document.documentElement.style.setProperty("--primary-gradient-to", toHex);
    
    localStorage.setItem("career-edge-theme-color-hex", hex);
    localStorage.setItem("career-edge-theme-color-from-hex", fromHex);
    localStorage.setItem("career-edge-theme-color-to-hex", toHex);

    // Sync to MongoDB
    fetch("/api/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        themeColor: colorName,
        themeColorHex: hex,
        themeGradientFrom: fromHex,
        themeGradientTo: toHex,
      }),
    }).catch((err) => {
      console.error("Failed to sync theme color to MongoDB:", err);
    });
  };

  const handleFontSelect = (fontName: string) => {
    setSelectedFont(fontName);
    
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
    localStorage.setItem("career-edge-theme-font", fontName);

    // Sync to MongoDB
    fetch("/api/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        font: fontName,
      }),
    }).catch((err) => {
      console.error("Failed to sync theme font to MongoDB:", err);
    });
  };

  const handleThemeSelect = (modeId: string) => {
    setTheme(modeId); // useThemeSync handles DB sync automatically
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h4 className="text-lg font-bold text-foreground">Appearance</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Customize the look and feel of your dashboard.
        </p>
      </div>

      <div className="border-t border-border my-2" />

      {/* Font */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold text-foreground">Font</h5>
        <div className="max-w-xs">
          <Select 
            value={selectedFont}
            onChange={handleFontSelect}
            options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
            className="h-10"
          />
        </div>
      </div>

      {/* Choose your mode */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold text-foreground">Choose your mode</h5>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = theme === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleThemeSelect(mode.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all cursor-pointer min-h-[100px] gap-2.5",
                  isSelected
                    ? "bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to border-primary text-white font-bold shadow-md shadow-primary/10"
                    : "border-border bg-secondary/15 hover:bg-secondary/30 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-7 h-7" />
                <span className="text-xs font-semibold">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme color */}
      <div className="space-y-4">
        <div>
          <h5 className="text-xs font-bold text-foreground">Theme color</h5>
        </div>

        {/* Solid Colors */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Solid Colours</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SOLID_COLORS.map((color) => {
              const isSelected = selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorSelect(color.name, color.hex)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border bg-secondary/10 hover:bg-secondary/20 dark:bg-secondary/20 dark:hover:bg-secondary/30 transition-all text-left cursor-pointer",
                    isSelected ? "ring-1 ring-offset-0" : "border-border"
                  )}
                  style={isSelected ? { borderColor: color.hex } : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-8 h-8 rounded-full shrink-0" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-semibold text-foreground">{color.name}</span>
                  </div>
                  {isSelected && (
                    <Check 
                      className="w-3.5 h-3.5 shrink-0" 
                      style={{ color: color.hex }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fun and New */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Fun and new</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GRADIENT_COLORS.map((color) => {
              const isSelected = selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorSelect(color.name, color.hex, color.from, color.to)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border bg-secondary/10 hover:bg-secondary/20 dark:bg-secondary/20 dark:hover:bg-secondary/30 transition-all text-left cursor-pointer",
                    isSelected ? "ring-1 ring-offset-0" : "border-border"
                  )}
                  style={isSelected ? { borderColor: color.hex } : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br animate-in fade-in duration-300" 
                      style={{ backgroundImage: `linear-gradient(to bottom right, ${color.from}, ${color.to})` }}
                    />
                    <span className="text-xs font-semibold text-foreground">{color.name}</span>
                  </div>
                  {isSelected && (
                    <Check 
                      className="w-3.5 h-3.5 shrink-0" 
                      style={{ color: color.hex }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
