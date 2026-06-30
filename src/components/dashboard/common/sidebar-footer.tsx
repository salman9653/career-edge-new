"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, MessageSquare, Sparkles, Sun, Moon, Monitor } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { useClickOutside } from "@/hooks/useClickOutside"
import { useThemeSync } from "@/hooks/useThemeSync"
import { NotificationPopover } from "./notification-popover"
import { ProfileCard } from "./profile-card"
import { ProfileMenu } from "./profile-menu"

import { User } from "@/types"
import { Tooltip } from "@/components/ui"

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
  const { theme, setTheme } = useThemeSync()
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
        <Tooltip content={getThemeLabel()} side={isCollapsed ? "right" : "top"} className="flex-1 justify-center">
          <button
            onClick={handleThemeToggle}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
            aria-label="Toggle Theme"
          >
            {getThemeIcon()}
          </button>
        </Tooltip>

        {/* Notification Tooltip & Popover */}
        <div className="relative flex-1 flex justify-center" ref={notificationsRef}>
          {activePopover === "notifications" ? (
            <button
              onClick={() => setActivePopover("none")}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 transition-transform hover:scale-110" />
            </button>
          ) : (
            <Tooltip content="Notifications" side={isCollapsed ? "right" : "top"} className="w-full justify-center">
              <button
                onClick={() => setActivePopover("notifications")}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5 transition-transform hover:scale-110" />
              </button>
            </Tooltip>
          )}

          {/* Floating Notifications Popover with Blurred Effect */}
          {activePopover === "notifications" && (
            <NotificationPopover onClose={() => setActivePopover("none")} />
          )}
        </div>

        {/* Chat Tooltip */}
        <div className="relative flex-1 flex justify-center">
          {activePopover === "chat" ? (
            <button
              onClick={() => setActivePopover("none")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
              aria-label="Chat"
            >
              <MessageSquare className="w-4.5 h-4.5 transition-transform hover:scale-110" />
            </button>
          ) : (
            <Tooltip content="Chat" side={isCollapsed ? "right" : "top"} className="w-full justify-center">
              <button
                onClick={() => setActivePopover("chat")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                aria-label="Chat"
              >
                <MessageSquare className="w-4.5 h-4.5 transition-transform hover:scale-110" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Career AI Tooltip */}
        <div className="relative flex-1 flex justify-center">
          {activePopover === "ai" ? (
            <button
              onClick={() => setActivePopover("none")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25 dark:border-primary/15 hover:bg-primary/20 transition-all cursor-pointer"
              aria-label="Career AI"
            >
              <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
            </button>
          ) : (
            <Tooltip content="Career AI" side={isCollapsed ? "right" : "top"} className="w-full justify-center">
              <button
                onClick={() => setActivePopover("ai")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25 dark:border-primary/15 hover:bg-primary/20 transition-all cursor-pointer"
                aria-label="Career AI"
              >
                <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
              </button>
            </Tooltip>
          )}
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
        {isCollapsed && activePopover !== "profile" ? (
          <Tooltip
            content={
              <div className="flex flex-col text-left">
                <span className="font-bold">{user.name}</span>
                <span className="text-[10px] opacity-80 mt-0.5">{user.email}</span>
              </div>
            }
            side="right"
            className="w-full"
          >
            <ProfileCard
              user={user}
              isCollapsed={isCollapsed}
              onClick={() => {
                setActivePopover((prev) => (prev === "profile" ? "none" : "profile"))
              }}
            />
          </Tooltip>
        ) : (
          <ProfileCard
            user={user}
            isCollapsed={isCollapsed}
            onClick={() => {
              setActivePopover((prev) => (prev === "profile" ? "none" : "profile"))
            }}
          />
        )}
      </div>

    </div>
  )
}
