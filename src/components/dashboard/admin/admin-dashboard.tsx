import React from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ShieldAlert, User, Sparkles, LayoutGrid } from "lucide-react"
import { User as UserType } from "@/types"

interface AdminDashboardProps {
  user: UserType
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="w-full space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass border shadow-xl bg-neutral-50/30 dark:bg-neutral-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/10">
            <Sparkles className="w-3.5 h-3.5" /> Admin Control Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            System Admin: <span className="bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text text-transparent">{user.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Centralized platform management dashboard for Career Edge applications.
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-rose-500/20 z-10 relative overflow-hidden">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="rounded-3xl glass border shadow-md p-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-rose-500" /> Admin Profile
            </CardTitle>
            <CardDescription className="text-xs">Your credential details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold text-foreground truncate max-w-[150px]">{user.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-bold text-rose-500 uppercase tracking-wider">{user.accountType}</span>
            </div>
          </CardContent>
        </Card>

        {/* Control Panel Placeholder */}
        <Card className="rounded-3xl glass border shadow-md p-2 md:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LayoutGrid className="w-4.5 h-4.5 text-indigo-500" /> Administrative Controls
            </CardTitle>
            <CardDescription className="text-xs">Platform monitoring & user directories</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">Under Development</p>
            <p className="text-[10px] text-muted-foreground max-w-xs">
              System monitoring, audit logs, and user directory management tools will be configured inside this workspace in the next sprint.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
