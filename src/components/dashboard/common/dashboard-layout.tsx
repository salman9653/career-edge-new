"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, FileSpreadsheet, Briefcase, Search, Building, Users, Command, X, MessageSquare, Bell, Award, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { User, CandidateProfile, CompanyProfile } from "@/types";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  profile: CandidateProfile | CompanyProfile | null;
  activeModule: string;
  setActiveModule: (module: string) => void;
  onOnboardingOpen?: () => void;
}

export function DashboardLayout({
  children,
  user,
  profile,
  activeModule,
  setActiveModule,
  onOnboardingOpen,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { headerTitle, headerBackHref } = useUIStore();

  const tableModules = ["questions", "candidates", "manage-companies", "ats", "crm", "jobs", "templates", "applications", "practice"];
  const isTableListingPage = tableModules.includes(activeModule) && pathname === `/dashboard/${activeModule}`;

  // Resolve Header Title on top area
  const getHeaderTitle = () => {
    if (activeModule === "dashboard") return "Dashboard";
    
    // Explicit title mappings matching sidebar navigation requested
    const titleMap: Record<string, string> = {
      ats: "Application Tracking System",
      crm: "Candidate Relation managment",
      templates: "Templates",
      questions: "Question Bank",
      companies: "Manage Companies",
      candidates: "Manage Candidates",
      app: "Manage App",
      applications: "My Applications",
      practice: "Practice",
      notifications: "Notifications",
    };

    if (activeModule === "jobs") {
      return user?.accountType === "company" ? "Posted Jobs" : "Jobs Search";
    }

    return titleMap[activeModule] || activeModule.replace("-", " ");
  };

  const resolvedTitle = headerTitle || getHeaderTitle();

  const capitalizedTitle = resolvedTitle
    ? resolvedTitle
        .split(/[\s-_]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isSpecialPath = pathname === "/dashboard/chat" || pathname === "/dashboard/notifications" || pathname === "/dashboard/more";
  const isActiveDashboard = pathname.startsWith("/dashboard") && !isSpecialPath;

  // Add global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getSearchItems = () => {
    const items = [
      { title: "Dashboard", path: "/dashboard", icon: Home },
      { title: "Profile", path: "/dashboard/profile", icon: Users },
    ];
    if (user?.accountType === "company") {
      items.push(
        { title: "ATS (Applicant Tracking)", path: "/dashboard/ats", icon: FileSpreadsheet },
        { title: "Posted Jobs", path: "/dashboard/jobs", icon: Briefcase },
        { title: "CRM", path: "/dashboard/crm", icon: Users },
        { title: "Templates", path: "/dashboard/templates", icon: FileText },
        { title: "Question Bank", path: "/dashboard/questions", icon: BookOpen }
      );
    } else if (user?.accountType === "candidate") {
      items.push(
        { title: "Jobs Search", path: "/dashboard/jobs", icon: Search },
        { title: "My Applications", path: "/dashboard/applications", icon: FileSpreadsheet },
        { title: "Practice", path: "/dashboard/practice", icon: Award }
      );
    } else if (user?.accountType === "admin") {
      items.push(
        { title: "Manage Companies", path: "/dashboard/manage-companies", icon: Building },
        { title: "Manage Candidates", path: "/dashboard/candidates", icon: Users }
      );
    }
    return items;
  };

  const searchItems = getSearchItems();
  const filteredItems = searchQuery
    ? searchItems.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchItems.slice(0, 4);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative font-sans">
      {/* Sidebar (handles mobile trigger, backdrop, collapse state, search, and navigation) */}
      <Sidebar
        user={user}
        activeModule={activeModule}
        onNavClick={setActiveModule}
        onOnboardingOpen={onOnboardingOpen}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Content Body Container */}
        <div className="flex-1 overflow-y-auto grid-bg pt-[88px] pb-20 md:pb-8 px-6 md:p-8 relative">
          <div className="w-full pb-8">
            {/* Local Page Header Row (rendered only if the page doesn't show a toolbar view switcher) */}
            {!isTableListingPage && capitalizedTitle && (
              <div className="hidden md:flex items-center gap-3.5 mb-6">
                {headerBackHref && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(headerBackHref)}
                    className="w-9 h-9 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer flex-shrink-0"
                  >
                    <ArrowLeft className="w-4.5 h-4.5" />
                  </Button>
                )}
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
                  {capitalizedTitle}
                </h1>
              </div>
            )}
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-around px-2 z-30 select-none">
        {/* Dashboard Link (All Roles) */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer",
            isActiveDashboard ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* Role Specific Link 1 */}
        {user?.accountType === "company" && (
          <Link
            href="/dashboard/ats"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer",
              pathname === "/dashboard/ats" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>ATS</span>
          </Link>
        )}
        {user?.accountType === "candidate" && (
          <Link
            href="/dashboard/jobs"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer",
              pathname === "/dashboard/jobs" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Search className="w-5 h-5" />
            <span>Jobs</span>
          </Link>
        )}
        {user?.accountType === "admin" && (
          <Link
            href="/dashboard/manage-companies"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer",
              pathname === "/dashboard/manage-companies" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building className="w-5 h-5" />
            <span>Companies</span>
          </Link>
        )}

        {/* Role Specific Link 2 */}
        {user?.accountType === "company" && (
          <Link
            href="/dashboard/jobs"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer",
              pathname === "/dashboard/jobs" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="w-5 h-5" />
            <span>Jobs</span>
          </Link>
        )}
        {user?.accountType === "candidate" && (
          <Link
            href="/dashboard/applications"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer",
              pathname === "/dashboard/applications" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Applications</span>
          </Link>
        )}
        {user?.accountType === "admin" && (
          <Link
            href="/dashboard/candidates"
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer",
              pathname === "/dashboard/candidates" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-5 h-5" />
            <span>Candidates</span>
          </Link>
        )}

        {/* Search / Command Bar (All Roles) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Command className="w-5 h-5" />
          <span>Search</span>
        </button>

        {/* More Options / Avatar Link (All Roles) */}
        <Link
          href="/dashboard/more"
          className={cn(
            "flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer",
            pathname === "/dashboard/more" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn("w-6 h-6 rounded-full overflow-hidden border flex items-center justify-center font-bold text-[9px]", pathname === "/dashboard/more" ? "border-primary text-primary" : "border-neutral-300 dark:border-neutral-700 text-muted-foreground")}>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <span>More</span>
        </Link>
      </div>

      {/* Command Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-20 px-4 pointer-events-auto">
          <div className="bg-background border border-neutral-200/50 dark:border-neutral-800/50 rounded-3xl w-full max-w-md p-5 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Command className="w-4 h-4 text-primary" /> Command Search
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools and pages..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                autoFocus
              />
            </div>
            
            {/* Search results / suggestions */}
            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block pl-1">
                {searchQuery ? "Search Results" : "Suggestions"}
              </span>
              <div className="flex flex-col gap-1">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.title}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          router.push(item.path);
                        }}
                        className="w-full p-2.5 text-xs font-bold text-foreground bg-card hover:bg-neutral-100 dark:hover:bg-neutral-900/50 border border-neutral-200/20 dark:border-neutral-800/30 rounded-xl cursor-pointer text-left flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200/10 dark:border-neutral-800/30 group-hover:scale-105 transition-transform text-muted-foreground">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span>{item.title}</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Jump to ↵</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
