"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Coins, ArrowRight } from "lucide-react";
import { Tooltip } from "@/components/ui";

interface CreditBalanceCardProps {
  user: any;
  profile: any;
  isCollapsed?: boolean;
  className?: string;
}

export function CreditBalanceCard({
  user,
  profile,
  isCollapsed = false,
  className
}: CreditBalanceCardProps) {
  const router = useRouter();

  const isCompany = user?.accountType === "company";
  const activePlan = profile?.activePlan || (isCompany ? "company-free" : "candidate-free");
  const aiTokens = profile?.aiTokens || { allocated: 15, purchased: 0, total: 15 };
  const allocated = aiTokens.allocated ?? 15;

  let maxTokens = 15;
  let planLabel = "Free";

  if (isCompany) {
    if (activePlan === "company-pro-plus") {
      maxTokens = 1000;
      planLabel = "Pro+";
    } else if (activePlan === "company-pro") {
      maxTokens = 250;
      planLabel = "Pro";
    }
  } else {
    if (activePlan === "candidate-pro-plus") {
      maxTokens = 500;
      planLabel = "Pro+";
    } else if (activePlan === "candidate-pro") {
      maxTokens = 150;
      planLabel = "Pro";
    }
  }

  const percentage = Math.min(100, Math.max(0, (allocated / maxTokens) * 100));
  const isFree = activePlan === (isCompany ? "company-free" : "candidate-free");

  const handleUpgradeClick = () => {
    if (typeof window !== "undefined") {
      const isDesktop = window.innerWidth >= 640;
      if (isDesktop) {
        router.push(`${window.location.pathname}?settings=true&tab=Billing`);
      } else {
        router.push("/dashboard/settings?tab=Billing");
      }
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-center w-full">
        <Tooltip content={`AI Credits: ${allocated}/${maxTokens} (${planLabel} Plan)`} side="right">
          <button
            onClick={handleUpgradeClick}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-ai-gradient text-white shadow-md border-0 cursor-pointer hover:scale-105 transition-transform"
          >
            <Coins className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-2xl border border-neutral-200/40 dark:border-neutral-800/40 p-4 space-y-3 relative overflow-hidden shadow-sm text-left ${className || ""}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Credits
        </span>
        <span className="text-xs font-black text-foreground">{allocated} / {maxTokens}</span>
      </div>
      
      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-ai-gradient transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] text-muted-foreground font-semibold uppercase">{planLabel} Plan</span>
        <button
          onClick={handleUpgradeClick}
          className="text-[9px] font-black text-primary hover:underline cursor-pointer border-0 bg-transparent flex items-center gap-0.5"
        >
          {activePlan.endsWith("-pro-plus") ? "Manage" : "Upgrade"} <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
