"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, MessageSquare, Sparkles, Sun, Moon, Monitor } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { useClickOutside } from "@/hooks/useClickOutside"
import { NotificationPopover } from "./notification-popover"
import { ProfileCard } from "./profile-card"
import { ProfileMenu } from "./profile-menu"

import { User } from "@/types"

interface SidebarFooterProps {
  user: User
  isCollapsed: boolean
  onOnboardingOpen?: () => void
}

type ActivePopover = "none" | "notifications" | "chat" | "ai" | "profile"

export function SidebarFooter({
  user,
  isCollapsed,
  onOnboardingOpen
}: SidebarFooterProps) {
  const router = useRouter()
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const [activePopover, setActivePopover] = useState<ActivePopover>("none")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  // Close popovers on click outside of registered containers
  useClickOutside([profileRef, notificationsRef], () => {
    setActivePopover("none")
  })

  const handleThemeToggle = () => {
    if (!mounted) return
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="w-4.5 h-4.5" />
    if (theme === "light") return <Sun className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400 transition-transform hover:scale-110" />
    if (theme === "dark") return <Moon className="w-4.5 h-4.5 text-indigo-400 transition-transform hover:scale-110" />
    return <Monitor className="w-4.5 h-4.5 text-neutral-500 transition-transform hover:scale-110" />
  }

  const getThemeLabel = () => {
    if (!mounted) return "Theme"
    if (theme === "light") return "Light Mode"
    if (theme === "dark") return "Dark Mode"
    return "System Mode"
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/")
            router.refresh()
          }
        }
      })
    } catch (err) {
      console.error("Failed to sign out:", err)
    }
  }

  return (
    <div className="p-4 border-t border-neutral-200/30 dark:border-neutral-800/30 space-y-4 bg-neutral-50/20 dark:bg-neutral-950/10">

      {/* Action Row: Theme, Notifications, Chat, AI Chat with custom hover tooltips */}
      <div className={cn("flex items-center gap-2", isCollapsed ? "flex-col" : "justify-between")}>

        {/* Theme Toggle Tooltip */}
        <div className="relative group flex-1 flex justify-center">
          <button
            onClick={handleThemeToggle}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
            aria-label="Toggle Theme"
          >
            {getThemeIcon()}
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0b0c16]/95 backdrop-blur-md border border-neutral-200/10 dark:border-neutral-800/30 text-white text-[10px] font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all pointer-events-none z-50">
            {getThemeLabel()}
          </div>
        </div>

        {/* Notification Tooltip & Popover */}
        <div className="relative group flex-1 flex justify-center" ref={notificationsRef}>
          <button
            onClick={() => {
              setActivePopover((prev) => (prev === "notifications" ? "none" : "notifications"))
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 transition-transform hover:scale-110" />
          </button>

          {/* Tooltip (only show if popover is closed to avoid overlays) */}
          {activePopover !== "notifications" && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0b0c16]/95 backdrop-blur-md border border-neutral-200/10 dark:border-neutral-800/30 text-white text-[10px] font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all pointer-events-none z-50">
              Notification
            </div>
          )}

          {/* Floating Notifications Popover with Blurred Effect */}
          {activePopover === "notifications" && (
            <NotificationPopover onClose={() => setActivePopover("none")} />
          )}
        </div>

        {/* Chat Tooltip */}
        <div className="relative group flex-1 flex justify-center">
          <button
            onClick={() => {
              setActivePopover((prev) => (prev === "chat" ? "none" : "chat"))
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
            aria-label="Chat"
          >
            <MessageSquare className="w-4.5 h-4.5 transition-transform hover:scale-110" />
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0b0c16]/95 backdrop-blur-md border border-neutral-200/10 dark:border-neutral-800/30 text-white text-[10px] font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all pointer-events-none z-50">
            Chat
          </div>
        </div>

        {/* Career AI Tooltip */}
        <div className="relative group flex-1 flex justify-center">
          <button
            onClick={() => {
              setActivePopover((prev) => (prev === "ai" ? "none" : "ai"))
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25 dark:border-primary/15 hover:bg-primary/20 transition-all cursor-pointer"
            aria-label="Career AI"
          >
            <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0b0c16]/95 backdrop-blur-md border border-primary/30 text-white text-[10px] font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all pointer-events-none z-50">
            Career AI
          </div>
        </div>

      </div>

      {/* User Profile Info Card */}
      <div className="relative" ref={profileRef}>
        {activePopover === "profile" && (
          <ProfileMenu
            user={user}
            isCollapsed={isCollapsed}
            onOnboardingOpen={onOnboardingOpen}
            onLogout={handleLogout}
            setDropdownOpen={(open) => setActivePopover(open ? "profile" : "none")}
          />
        )}

        {/* Profile trigger box */}
        <ProfileCard
          user={user}
          isCollapsed={isCollapsed}
          onClick={() => {
            setActivePopover((prev) => (prev === "profile" ? "none" : "profile"))
          }}
        />
      </div>

    </div>
  )
}
