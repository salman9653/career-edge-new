"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabItem {
  name: string;
  icon: LucideIcon;
}

interface SettingsSidebarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsSidebar({
  tabs,
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <div className="w-56 shrink-0 bg-secondary/60 dark:bg-secondary/30 p-5 md:p-6 border-r border-border flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-foreground">Settings</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
          Manage your account and app settings.
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.name)}
              className={cn(
                "w-full flex items-center gap-2.5 py-2.5 transition-colors duration-200 cursor-pointer text-left relative pl-4 pr-3 rounded-xl",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-100/60 dark:hover:bg-neutral-900/40"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsBackground"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.32, duration: 0.55 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="activeSettingsMarker"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[16px] bg-primary rounded-r-full"
                  transition={{ type: "spring", bounce: 0.32, duration: 0.55 }}
                />
              )}

              <Icon className={cn(
                "w-4 h-4 relative z-10",
                isActive ? "text-primary dark:text-primary" : "text-muted-foreground"
              )} />
              <span className="text-xs font-bold relative z-10">{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
