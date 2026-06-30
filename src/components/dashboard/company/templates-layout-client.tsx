"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { User } from "@/types";

interface TemplatesLayoutClientProps {
  user: User;
  children: React.ReactNode;
}

export function TemplatesLayoutClient({ children }: TemplatesLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname?.includes("/ai-interview") ? "ai-interview" : "assessments";

  // Update header based on viewport and tab selection
  useEffect(() => {
    const updateHeader = () => {
      const isMobile = window.innerWidth < 640;
      const { setHeader } = useUIStore.getState();
      
      if (isMobile) {
        setHeader(
          activeTab === "assessments" ? "Assessments" : "AI Interviews",
          activeTab === "assessments" ? "Assessment templates" : "AI Interview templates"
        );
      } else {
        setHeader(
          "Assessments / AI Interviews",
          "Manage assessment templates and AI interview setups."
        );
      }
    };

    updateHeader();
    window.addEventListener("resize", updateHeader);
    return () => {
      window.removeEventListener("resize", updateHeader);
    };
  }, [activeTab]);

  // Clean up header on layout unmount
  useEffect(() => {
    return () => {
      const { clearHeader } = useUIStore.getState();
      clearHeader();
    };
  }, []);

  return (
    <div className="w-full">
      {children}
    </div>
  );
}
