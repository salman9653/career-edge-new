"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useUIStore } from "@/store/useUIStore"
import { useClickOutside } from "@/hooks/useClickOutside"
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
  Award,
  ArrowLeft,
  MessageSquare,
  Bell,
  Coins
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
  profile?: any
  activeModule: string
  onNavClick: (moduleId: string) => void
  onOnboardingOpen?: () => void
  onSearchClick?: () => void
}

export function Sidebar({
  user,
  profile,
  activeModule,
  onNavClick,
  onOnboardingOpen,
  onSearchClick
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { headerTitle, headerBackHref } = useUIStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Collapse sidebar by default on mount/resize if in tablet range (< 1024px)
  useEffect(() => {
    const checkViewport = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }
    checkViewport()
    window.addEventListener("resize", checkViewport)
    return () => window.removeEventListener("resize", checkViewport)
  }, [])

  // Collapse sidebar if clicking outside on tablet viewports (< 1024px)
  useClickOutside(sidebarRef, () => {
    if (window.innerWidth < 1024 && !isCollapsed) {
      setIsCollapsed(true)
    }
  })

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  useClickOutside(avatarMenuRef, () => {
    if (avatarMenuOpen) {
      setAvatarMenuOpen(false)
    }
  })

  // Get navigation links based on user role
  const getNavItems = (): NavItem[] => {
    switch (user?.accountType) {
      case "admin":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "manage-companies", label: "Manage Companies", icon: Building },
          { id: "candidates", label: "Manage Candidates", icon: Users },
          { id: "manage-pricing", label: "Manage Pricing", icon: Coins },
          { id: "manage-app", label: "Manage App", icon: Settings }
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

  // Navigation items are static locally since typing opens global search modal
  const filteredNavItems = navItems

  const handleNavClick = (moduleId: string) => {
    onNavClick(moduleId)
    setIsMobileOpen(false) // Close drawer on mobile
    if (window.innerWidth < 1024) {
      setIsCollapsed(true)
    }
  }

  // Resolve Header Title on top area
  const getHeaderTitle = () => {
    if (activeModule === "dashboard") return "Dashboard"
    
    // Explicit title mappings matching sidebar navigation requested
    const titleMap: Record<string, string> = {
      ats: "Application Tracking System",
      crm: "Candidate Relation managment",
      templates: "Templates",
      questions: "Question Bank",
      companies: "Manage Companies",
      candidates: "Manage Candidates",
      "manage-pricing": "Manage Pricing",
      "manage-app": "Manage App",
      applications: "My Applications",
      practice: "Practice",
      notifications: "Notifications",
    }

    if (activeModule === "jobs") {
      return user?.accountType === "company" ? "Posted Jobs" : "Jobs Search"
    }

    return titleMap[activeModule] || activeModule.replace("-", " ")
  }

  const isCheckoutResultPage = pathname === "/dashboard/checkout/success" || pathname === "/dashboard/checkout/error"
  const resolvedTitle = isCheckoutResultPage ? "" : (headerTitle || getHeaderTitle())

  const capitalizedTitle = resolvedTitle
    ? resolvedTitle
        .split(/[\s-_]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : ""

  return (
    <>
      {/* Mobile Top Header (hidden on desktop/tablet) */}
      <div className="sm:hidden flex items-center justify-between w-full h-16 px-4 bg-background/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 absolute top-0 left-0 z-30">
        <div className="flex items-center space-x-2 flex-grow overflow-hidden">
          <Link href="/" className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
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
          </Link>
          {activeModule !== "more" && (
            <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
          )}
          {headerBackHref && activeModule !== "more" && !isCheckoutResultPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="w-8 h-8 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </Button>
          )}
          {activeModule === "more" ? (
            <span className="text-sm font-bold tracking-tight text-foreground">
              Career<span className="text-primary">Edge</span>
            </span>
          ) : (
            <h1 className="text-sm font-extrabold tracking-tight text-foreground truncate text-left">
              {activeModule === "upgrade" ? "Upgrade" : capitalizedTitle}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Chat Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/chat")}
            className="w-9 h-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 cursor-pointer"
            aria-label="Chat"
          >
            <MessageSquare className="w-4.5 h-4.5 text-foreground" />
          </Button>

          {/* Notifications Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/notifications")}
            className="w-9 h-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-foreground" />
          </Button>
        </div>
      </div>

      {/* Sidebar Container (desktop/tablet) */}
      <aside
        className={cn(
          "hidden sm:flex flex-col h-full relative z-20 flex-shrink-0 w-20 transition-all duration-300",
          !isCollapsed && "lg:w-64"
        )}
      >
        {/* Inner Panel - overlays on tablet, flex child on desktop */}
        <div
          ref={sidebarRef}
          className={cn(
            "h-full flex flex-col glass border-r shadow-lg transition-all duration-300 bg-neutral-50/50 dark:bg-neutral-950/20 w-20 relative",
            !isCollapsed && "w-64 sm:absolute sm:left-0 sm:top-0 sm:h-full sm:z-30 sm:shadow-2xl lg:relative lg:shadow-none"
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

            {/* Collapse toggle button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden sm:flex absolute -right-3 top-8 w-6.5 h-6.5 rounded-full border border-neutral-200/60 dark:border-neutral-800/60 bg-background shadow-md items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-105 z-50"
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Command Search Section */}
          <div className="hidden sm:block">
            <CommandBar
              isCollapsed={isCollapsed}
              onSearchClick={onSearchClick}
            />
          </div>

          {/* Navigation Links */}
          <SidebarNav
            navItems={filteredNavItems}
            activeModule={activeModule}
            isCollapsed={isCollapsed}
            onNavClick={handleNavClick}
          />

          {/* Sidebar Footer Section */}
          <div className="hidden sm:block">
            <SidebarFooter
              user={user}
              profile={profile}
              isCollapsed={isCollapsed}
              onOnboardingOpen={onOnboardingOpen}
            />
          </div>
        </div>
      </aside>
    </>
  )
}
