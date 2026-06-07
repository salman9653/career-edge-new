"use client";

import React from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"

interface NotificationPopoverProps {
  onClose: () => void
}

export function NotificationPopover({ onClose }: NotificationPopoverProps) {
  const router = useRouter()

  return (
    <div className="absolute bottom-14 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/75 dark:bg-[#07070b]/75 backdrop-blur-xl shadow-2xl p-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 w-72 overflow-hidden left-0">
      {/* Popover Header */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-900 font-extrabold text-sm text-foreground text-left">
        Notifications
      </div>

      {/* Popover Body */}
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-muted-foreground/60 border border-neutral-200/10 dark:border-neutral-800/20">
          <Bell className="w-4.5 h-4.5 text-muted-foreground/80" />
        </div>
        <p className="text-xs text-muted-foreground font-semibold">
          No new notifications
        </p>
      </div>

      {/* Popover Footer */}
      <div className="border-t border-neutral-150 dark:border-neutral-900 py-3 bg-neutral-50/20 dark:bg-neutral-950/10 text-center">
        <button
          onClick={() => {
            onClose()
            router.push("/dashboard/notifications")
          }}
          className="text-xs font-bold text-primary hover:text-primary/80 transition-colors block mx-auto cursor-pointer"
        >
          Show all notifications
        </button>
      </div>
    </div>
  )
}
