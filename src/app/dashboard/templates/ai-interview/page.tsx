"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UnderDevelopmentModule } from "@/components/dashboard/common/under-development";
import { cn } from "@/lib/utils";

export default function AIInterviewPage() {
  const router = useRouter();

  const tabs = [
    { id: "assessments", label: "Assessments", isActive: false, onClick: () => router.push("/dashboard/templates/assessments") },
    { id: "ai-interview", label: "AI Interviews", isActive: true, onClick: () => {} },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toolbar Row with Tab Switcher for Desktop */}
      <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 p-1 rounded-xl gap-1 flex-shrink-0 h-10 sm:h-11 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={tab.onClick}
            className={cn(
              "px-4 h-8 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer text-xs font-bold whitespace-nowrap",
              tab.isActive
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <UnderDevelopmentModule title="AI Interviews" />
    </div>
  );
}
