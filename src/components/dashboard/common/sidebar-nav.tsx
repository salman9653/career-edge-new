"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui"

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarNavProps {
  navItems: NavItem[]
  activeModule: string
  isCollapsed: boolean
  onNavClick: (id: string) => void
}

export function SidebarNav({
  navItems,
  activeModule,
  isCollapsed,
  onNavClick
}: SidebarNavProps) {
  return (
    <nav className={cn("flex-1 px-3 py-4 space-y-1.5", isCollapsed ? "overflow-y-visible" : "overflow-y-auto")}>
      {navItems.length > 0 ? (
        navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeModule === item.id

          const buttonEl = (
            <button
              onClick={() => onNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3.5 pr-3.5 py-2.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer group text-left relative pl-4",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:bg-neutral-100/60 dark:hover:bg-neutral-900/40 hover:text-foreground",
                isCollapsed && "justify-center pr-0 pl-0"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarBackground"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.32, duration: 0.55 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarMarker"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[20px] bg-primary rounded-r-full"
                  transition={{ type: "spring", bounce: 0.32, duration: 0.55 }}
                />
              )}

              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 relative z-10",
                isActive ? "text-primary dark:text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && <span className="truncate relative z-10">{item.label}</span>}
            </button>
          )

          if (isCollapsed) {
            return (
              <Tooltip key={item.id} content={item.label} side="right" className="w-full justify-center">
                {buttonEl}
              </Tooltip>
            )
          }

          return (
            <React.Fragment key={item.id}>
              {buttonEl}
            </React.Fragment>
          )
        })
      ) : (
        <p className="text-center text-[10px] text-muted-foreground py-4">No modules found</p>
      )}
    </nav>
  )
}
