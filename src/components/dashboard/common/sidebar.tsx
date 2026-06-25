"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  Building,
  Users,
  BookOpen,
  Settings,
  FileSpreadsheet,
  FileText,
  Search,
  Award
} from "lucide-react"
import { CommandBar } from "./command-bar"
import { SidebarNav } from "./sidebar-nav"
import { SidebarFooter } from "./sidebar-footer"

import { User } from "@/types"

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  user: User
  activeModule: string
  onNavClick: (moduleId: string) => void
  onOnboardingOpen?: () => void
}

export function Sidebar({
  user,
  activeModule,
  onNavClick,
  onOnboardingOpen
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Get navigation links based on user role
  const getNavItems = (): NavItem[] => {
    switch (user?.accountType) {
      case "admin":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "manage-companies", label: "Manage Companies", icon: Building },
          { id: "candidates", label: "Manage Candidates", icon: Users },
          { id: "app", label: "Manage App", icon: Settings }
        ]
      case "company":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "ats", label: "ATS", icon: FileSpreadsheet },
          { id: "crm", label: "CRM", icon: Users },
          { id: "jobs", label: "Posted Jobs", icon: Briefcase },
          { id: "templates", label: "Templates", icon: FileText },
          { id: "questions", label: "Question Bank", icon: BookOpen }
        ]
      case "candidate":
      default:
        return [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "jobs", label: "Jobs Search", icon: Search },
          { id: "applications", label: "My Applications", icon: FileSpreadsheet },
          { id: "practice", label: "Practice", icon: Award }
        ]
    }
  }

  const navItems = getNavItems()

  // Filter navigation items if search is used
  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNavClick = (moduleId: string) => {
    onNavClick(moduleId)
    setIsMobileOpen(false) // Close drawer on mobile
  }

  return (
    <>
      {/* Mobile Top Header (hidden on desktop) */}
      <div className="md:hidden flex items-center justify-between w-full h-16 px-4 bg-background/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 absolute top-0 left-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Image
              src="/logo_light.png"
              alt="CareerEdge Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain dark:hidden"
            />
            <Image
              src="/logo_dark.png"
              alt="CareerEdge Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain hidden dark:block"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Career<span className="text-primary">Edge</span>
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </Button>
      </div>

      {/* Backdrop for Mobile Sidebar Drawer */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full glass border-r shadow-lg transition-all duration-300 bg-neutral-50/50 dark:bg-neutral-950/20",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-neutral-200/30 dark:border-neutral-800/30 relative">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <Image
                src="/logo_light.png"
                alt="CareerEdge Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain dark:hidden"
              />
              <Image
                src="/logo_dark.png"
                alt="CareerEdge Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain hidden dark:block"
              />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                Career<span className="text-primary">Edge</span>
              </span>
            )}
          </Link>

          {/* Close button for Mobile drawer only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Collapse toggle button for Desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-8 w-6.5 h-6.5 rounded-full border border-neutral-200/60 dark:border-neutral-800/60 bg-background shadow-md items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-105 z-50"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Command Search Section */}
        <CommandBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isCollapsed={isCollapsed}
          onExpandSidebar={() => setIsCollapsed(false)}
        />

        {/* Navigation Links */}
        <SidebarNav
          navItems={filteredNavItems}
          activeModule={activeModule}
          isCollapsed={isCollapsed}
          onNavClick={handleNavClick}
        />

        {/* Sidebar Footer Section */}
        <SidebarFooter
          user={user}
          isCollapsed={isCollapsed}
          onOnboardingOpen={onOnboardingOpen}
        />
      </aside>
    </>
  )
}
