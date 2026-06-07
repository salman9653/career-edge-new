import React from "react";
import { User, CandidateProfile, CompanyProfile } from "@/types";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

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
  activeModule,
  setActiveModule,
  onOnboardingOpen,
}: DashboardLayoutProps) {
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

  const headerTitle = getHeaderTitle();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative font-sans">
      {/* Sidebar (handles mobile trigger, backdrop, collapse state, search, and navigation) */}
      <Sidebar
        user={user}
        activeModule={activeModule}
        onNavClick={setActiveModule}
        onOnboardingOpen={onOnboardingOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Module Header Bar */}
        <TopBar title={headerTitle} />

        {/* Content Body Container */}
        <div className="flex-1 overflow-y-auto grid-bg p-6 sm:p-8 relative">
          <div className="w-full pb-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
