import React from "react"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="w-full space-y-6">
      <div className="rounded-3xl glass border shadow-xl bg-neutral-50/20 dark:bg-neutral-900/5 p-8 relative overflow-hidden min-h-[400px]">
        {/* Background decoration glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">
          All Notifications
        </h2>

        {/* No notifications empty state */}
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-[#13141f] flex items-center justify-center text-muted-foreground border border-neutral-250/20 dark:border-neutral-800/40">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              No notifications yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              When you receive alerts regarding job matches, recruiter messages, or updates, they will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
