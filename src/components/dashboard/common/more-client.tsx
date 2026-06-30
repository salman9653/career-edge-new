"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, ChevronRight, Users, FileText, BookOpen, Award, Sun, Moon, Monitor, Video } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useUIStore } from "@/store/useUIStore";
import { User as UserType } from "@/types";
import { cn } from "@/lib/utils";
import { useThemeSync } from "@/hooks/useThemeSync";

interface MoreClientProps {
  user: UserType;
}

export function MoreClient({ user }: MoreClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useThemeSync();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : "system";

  // Redirect if screen is larger than mobile (640px matches sm breakpoint)
  React.useEffect(() => {
    const checkViewport = () => {
      if (window.innerWidth >= 640) {
        router.replace("/dashboard");
      }
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, [router]);

  // Set TopBar details dynamically
  React.useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("More Options", "Configure settings, edit profile, or sign out.");
    return () => clearHeader();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const getRemainingModules = () => {
    switch (user?.accountType) {
      case "company":
        return [
          {
            title: "CRM",
            description: "Manage candidate relations",
            icon: Users,
            path: "/dashboard/crm",
            colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20"
          },
          {
            title: "Assessments",
            description: "Assessment templates",
            icon: FileText,
            path: "/dashboard/templates/assessments",
            colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20"
          },
          {
            title: "AI-Interview",
            description: "AI Interview templates",
            icon: Video,
            path: "/dashboard/templates/ai-interview",
            colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20"
          },
          {
            title: "Question Bank",
            description: "Manage test questions",
            icon: BookOpen,
            path: "/dashboard/questions",
            colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          }
        ];
      case "candidate":
        return [
          {
            title: "Practice",
            description: "Coding & interview practice",
            icon: Award,
            path: "/dashboard/practice",
            colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20"
          }
        ];
      case "admin":
        return [
          {
            title: "Manage App",
            description: "Configure app preferences",
            icon: Settings,
            path: "/dashboard/app",
            colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20"
          }
        ];
      default:
        return [];
    }
  };

  const remainingModules = getRemainingModules();

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-left pb-10 px-4 md:px-0 mt-4 animate-in fade-in duration-300">
      {/* Profile Details Card */}
      <div className="glass border border-neutral-200/40 dark:border-neutral-800/40 rounded-3xl p-6 bg-card flex items-center gap-4 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to flex items-center justify-center text-white font-extrabold text-2xl shadow-md overflow-hidden relative flex-shrink-0">
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
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-bold text-foreground truncate">{user.name}</span>
          <span className="text-xs text-muted-foreground truncate mb-1">{user.email}</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/10 w-fit">
            {user.accountType} Account
          </span>
        </div>
      </div>

      {/* Remaining Modules Grid */}
      {remainingModules.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider pl-1">
            More Tools
          </span>
          <div className="grid grid-cols-2 gap-3.5">
            {remainingModules.map((mod) => {
              const IconComponent = mod.icon;
              return (
                <button
                  key={mod.title}
                  onClick={() => router.push(mod.path)}
                  className="p-4 rounded-3xl border border-neutral-200/30 dark:border-neutral-800/30 bg-card hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300 text-left flex flex-col gap-3 group cursor-pointer"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform", mod.colorClass)}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground truncate">{mod.title}</h4>
                    <p className="text-[9px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{mod.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Links List */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider pl-1">
          Preferences
        </span>

        {/* Theme Toggle Card */}
        <div className="w-full flex items-center justify-between p-4 rounded-2xl border border-neutral-200/30 dark:border-neutral-800/30 bg-card hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              {currentTheme === "light" ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : currentTheme === "dark" ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Monitor className="w-5 h-5 text-neutral-500" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Appearance</div>
              <div className="text-[10px] text-muted-foreground capitalize">
                {currentTheme} Theme Active
              </div>
            </div>
          </div>
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1.5 border border-neutral-200/30 dark:border-neutral-800/30 gap-0.5">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "p-2.5 rounded-lg transition-all cursor-pointer",
                currentTheme === "light" ? "bg-white dark:bg-neutral-800 text-amber-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Light Mode"
            >
              <Sun className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "p-2.5 rounded-lg transition-all cursor-pointer",
                currentTheme === "dark" ? "bg-white dark:bg-neutral-800 text-indigo-400 shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Dark Mode"
            >
              <Moon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "p-2.5 rounded-lg transition-all cursor-pointer",
                currentTheme === "system" ? "bg-white dark:bg-neutral-800 text-neutral-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="System Mode"
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Link */}
        <button
          onClick={() => router.push("/dashboard/profile")}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-neutral-200/30 dark:border-neutral-800/30 bg-card hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">View & Edit Profile</div>
              <div className="text-[10px] text-muted-foreground">Manage details, resume, and experience</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Settings Link */}
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-neutral-200/30 dark:border-neutral-800/30 bg-card hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Settings</div>
              <div className="text-[10px] text-muted-foreground">Preferences, password, and integration settings</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Logout Link */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-red-500/10 dark:border-red-500/5 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/20 hover:shadow-md transition-all duration-300 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 group-hover:scale-105 transition-transform">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-red-500 dark:text-red-400">Sign Out</div>
              <div className="text-[10px] text-red-400/80">Log out of your CareerEdge account</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400/80 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
