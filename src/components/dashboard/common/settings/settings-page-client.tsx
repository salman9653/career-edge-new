"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Palette,
  MessageSquare,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  LucideIcon,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { AccountSettings } from "./account-settings";
import { AppearanceSettings } from "./appearance-settings";
import { ChatSettings } from "./chat-settings";
import { NotificationsSettings } from "./notifications-settings";
import { SecuritySettings } from "./security-settings";
import { HelpSettings } from "./help-settings";
import { BillingSettings } from "./billing-settings";
import { User as UserType } from "@/types";

interface Section {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
}

const SECTIONS: Section[] = [
  {
    id: "Account",
    name: "Account",
    description: "Email, profile details, and sign-out",
    icon: User,
    color: "text-blue-500",
    iconBg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "Appearance",
    name: "Appearance",
    description: "Theme color, dark mode, and font",
    icon: Palette,
    color: "text-purple-500",
    iconBg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "Billing",
    name: "Plans & Billing",
    description: "Manage subscription limits and AI tokens",
    icon: Coins,
    color: "text-indigo-500",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: "Chat",
    name: "Chat",
    description: "Chat preferences and notifications",
    icon: MessageSquare,
    color: "text-emerald-500",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "Notifications",
    name: "Notifications",
    description: "Push, email, and in-app alerts",
    icon: Bell,
    color: "text-amber-500",
    iconBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "Security",
    name: "Security",
    description: "Password, two-factor authentication",
    icon: Shield,
    color: "text-rose-500",
    iconBg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    id: "Help",
    name: "Help",
    description: "Support, FAQs, and documentation",
    icon: HelpCircle,
    color: "text-neutral-500",
    iconBg: "bg-neutral-500/10 border-neutral-500/20",
  },
];

interface SettingsPageClientProps {
  user: UserType;
}

export function SettingsPageClient({ user }: SettingsPageClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Redirect to dashboard if on desktop/tablet
  useEffect(() => {
    const checkViewport = () => {
      if (window.innerWidth >= 640) {
        router.replace("/dashboard");
      }
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, [router]);

  // Set TopBar header
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("Settings", "Manage your account and app preferences.");
    return () => clearHeader();
  }, []);

  const handleSectionOpen = (sectionId: string) => {
    setDirection("forward");
    setActiveSection(sectionId);
  };

  const handleBack = () => {
    setDirection("back");
    setActiveSection(null);
  };

  const slideVariants = {
    enterForward: { x: "100%", opacity: 0 },
    enterBack: { x: "-30%", opacity: 0 },
    center: { x: 0, opacity: 1 },
    exitForward: { x: "-30%", opacity: 0 },
    exitBack: { x: "100%", opacity: 0 },
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "Account":
        return (
          <AccountSettings
            user={user}
            onClose={() => router.push("/dashboard/settings")}
          />
        );
      case "Appearance":
        return <AppearanceSettings />;
      case "Billing":
        return <BillingSettings />;
      case "Chat":
        return <ChatSettings />;
      case "Notifications":
        return <NotificationsSettings />;
      case "Security":
        return <SecuritySettings activeTab="Security" onClose={handleBack} />;
      case "Help":
        return <HelpSettings />;
      default:
        return null;
    }
  };

  const activeInfo = SECTIONS.find((s) => s.id === activeSection);
  const allowedSections = SECTIONS.filter(s => {
    if (s.id === "Billing" && user?.accountType !== "company") return false;
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden relative" style={{ minHeight: "calc(100vh - 130px)" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {!activeSection ? (
          /* ── Section List View ── */
          <motion.div
            key="list"
            initial={direction === "back" ? { x: "-30%", opacity: 0 } : { x: 0, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={direction === "forward" ? { x: "-30%", opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-full px-4 pb-10 mt-4 space-y-2 animate-in fade-in duration-200"
          >
            <p className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider pl-1 mb-4">
              Preferences
            </p>
            {allowedSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionOpen(section.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-neutral-200/30 dark:border-neutral-800/30 bg-card hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform",
                        section.iconBg
                      )}
                    >
                      <Icon className={cn("w-5 h-5", section.color)} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {section.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {section.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </button>
              );
            })}
          </motion.div>
        ) : (
          /* ── Section Detail View ── */
          <motion.div
            key={activeSection}
            initial={slideVariants.enterForward}
            animate={slideVariants.center}
            exit={slideVariants.exitBack}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-full"
          >
            {/* Section Header with Back Button */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <button
                onClick={handleBack}
                className="w-9 h-9 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-card hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                aria-label="Back to Settings"
              >
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
              {activeInfo && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center border flex-shrink-0",
                      activeInfo.iconBg
                    )}
                  >
                    <activeInfo.icon
                      className={cn("w-4 h-4", activeInfo.color)}
                    />
                  </div>
                  <span className="text-base font-extrabold text-foreground truncate">
                    {activeInfo.name}
                  </span>
                </div>
              )}
            </div>

            {/* Section Content */}
            <div className="px-4 pb-10 pt-2 space-y-0">
              {renderSectionContent(activeSection)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
