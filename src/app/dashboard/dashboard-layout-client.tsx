"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/common/dashboard-layout";
import { AccountTypeSelection } from "@/components/auth/account-type-selection";
import { SettingsModal } from "@/components/dashboard/common";
import { User, CandidateProfile, CompanyProfile } from "@/types";
import { DashboardThemeApplier } from "@/components/dashboard/common/dashboard-theme-applier";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: User;
  profile: CandidateProfile | CompanyProfile | null;
}

export function DashboardLayoutClient({ children, user, profile }: DashboardLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const showSettings = searchParams?.get("settings") === "true";
  const activeTab = searchParams?.get("tab") || "Account";

  // Track whether we're on a mobile viewport — modal only renders on desktop/tablet
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Determine active module from pathname (supporting sub-routes)
  const activeModule = pathname === "/dashboard"
    ? "dashboard"
    : pathname?.replace("/dashboard/", "").split("/")[0] || "dashboard";

  const handleSetActiveModule = (module: string) => {
    if (module === "dashboard") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard/${module}`);
    }
  };

  const handleTabChange = (tabName: string) => {
    router.push(`${pathname}?settings=true&tab=${tabName}`);
  };

  const handleCloseSettings = () => {
    router.push(pathname);
  };

  // Early return for users who have not selected their account type yet
  if (user.accountType === "unselected" || !user.accountType) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 grid-bg bg-background flex flex-col items-center justify-center relative w-full animate-in fade-in duration-300">
        <DashboardThemeApplier />
        <AccountTypeSelection user={user} />
      </div>
    );
  }

  return (
    <>
      <DashboardThemeApplier />
      <DashboardLayout
        user={user}
        profile={profile}
        activeModule={activeModule}
        setActiveModule={handleSetActiveModule}
      >
        {children}
      </DashboardLayout>

      {/* Settings modal — desktop only. Mobile uses /dashboard/settings page */}
      {isDesktop && (
        <SettingsModal
          isOpen={showSettings}
          onClose={handleCloseSettings}
          user={user}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </>
  );
}

