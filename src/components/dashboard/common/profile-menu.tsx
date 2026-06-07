"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { User as UserType } from "@/types";
import {
  User,
  Palette,
  Settings,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";

interface ProfileMenuProps {
  user: UserType;
  isCollapsed: boolean;
  onOnboardingOpen?: () => void;
  onLogout: () => Promise<void>;
  setDropdownOpen: (open: boolean) => void;
}

export function ProfileMenu({
  user,
  isCollapsed,
  onOnboardingOpen,
  onLogout,
  setDropdownOpen,
}: ProfileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false);

  return (
    <div className={cn(
      "absolute bottom-16 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/75 dark:bg-[#07070b]/75 backdrop-blur-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 w-60",
      isCollapsed ? "left-0" : "left-0 w-full"
    )}>
      {/* User Profile Block Header */}
      <div className="flex items-center space-x-3 p-2 border-b border-neutral-100 dark:border-neutral-900 pb-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to flex items-center justify-center text-white font-extrabold text-sm shadow-md overflow-hidden relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-foreground truncate">{user.name}</span>
          <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-0.5 relative">
        <button
          onClick={() => {
            setDropdownOpen(false);
            setShowThemeSubmenu(false);
            router.push("/dashboard/profile");
          }}
          className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-foreground hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-all cursor-pointer"
        >
          <User className="w-4 h-4 text-muted-foreground" /> Profile
        </button>

        {/* Theme selector trigger with Chevron Right */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowThemeSubmenu(!showThemeSubmenu);
            }}
            className="w-full text-left flex items-center justify-between p-2 rounded-xl text-xs font-bold text-foreground hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-muted-foreground" /> Theme
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Floating Theme Submenu with Blurred Effect */}
          {showThemeSubmenu && (
            <div
              className={cn(
                "absolute bottom-0 z-50 w-44 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-[#07070b]/80 backdrop-blur-xl shadow-2xl p-2 animate-in fade-in slide-in-from-left-2 duration-200 left-full ml-2"
              )}
            >
              <button
                onClick={() => {
                  setTheme("light");
                  setShowThemeSubmenu(false);
                  setDropdownOpen(false);
                }}
                className="w-full text-left flex items-center justify-between p-2 rounded-xl text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sun className="w-4 h-4 text-muted-foreground" /> Light
                </div>
                {theme === "light" && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
              <button
                onClick={() => {
                  setTheme("dark");
                  setShowThemeSubmenu(false);
                  setDropdownOpen(false);
                }}
                className="w-full text-left flex items-center justify-between p-2 rounded-xl text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-muted-foreground" /> Dark
                </div>
                {theme === "dark" && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
              <button
                onClick={() => {
                  setTheme("system");
                  setShowThemeSubmenu(false);
                  setDropdownOpen(false);
                }}
                className="w-full text-left flex items-center justify-between p-2 rounded-xl text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-muted-foreground" /> System
                </div>
                {theme === "system" && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
              <div className="border-t border-neutral-100 dark:border-neutral-900 my-1" />
              <button
                onClick={() => {
                  setShowThemeSubmenu(false);
                  setDropdownOpen(false);
                  router.push(`${pathname}?settings=true&tab=Appearance`);
                }}
                className="w-full text-left flex items-center p-2 rounded-xl text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <span className="truncate">Appearance settings</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setDropdownOpen(false);
            setShowThemeSubmenu(false);
            router.push(`${pathname}?settings=true&tab=Account`);
          }}
          className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-foreground hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 text-muted-foreground" /> Settings
        </button>

        <div className="border-t border-neutral-100 dark:border-neutral-900 my-1.5" />

        <button
          onClick={() => {
            setDropdownOpen(false);
            setShowThemeSubmenu(false);
            onLogout();
          }}
          className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </div>
  );
}
