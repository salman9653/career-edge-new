"use client";

import React, { useState } from "react";
import { X, Bell } from "lucide-react";
import { CandidateDashboard } from "@/components/dashboard/candidate/candidate-dashboard";
import { CompanyDashboard } from "@/components/dashboard/company/company-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";
import { OnboardingDialog } from "@/components/auth/onboarding-dialog";
import { AnimatePresence, motion } from "motion/react";
import { User, CandidateProfile, CompanyProfile } from "@/types";

interface DashboardClientProps {
  user: User;
  profile: CandidateProfile | CompanyProfile | null;
}

export function DashboardClient({ user, profile }: DashboardClientProps) {
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    return (
      Boolean(user) &&
      user.accountType !== "admin" &&
      user.accountType !== "unselected" &&
      !user.isOnboarded &&
      !user.onboardingSkipped
    );
  });
  const [toastDismissed, setToastDismissed] = useState(false);

  // Show Toast if skipped, not onboarded, not locally dismissed, and modal is not currently open (exclude admins)
  const showSkippedToast =
    user.accountType !== "admin" &&
    !user.isOnboarded &&
    user.onboardingSkipped &&
    !toastDismissed &&
    !onboardingOpen;

  const renderDashboard = () => {
    switch (user.accountType) {
      case "candidate":
        return (
          <CandidateDashboard
            user={user}
            profile={profile as CandidateProfile}
            onOnboardingOpen={() => setOnboardingOpen(true)}
          />
        );
      case "company":
        return (
          <CompanyDashboard
            user={user}
            profile={profile as CompanyProfile}
            onOnboardingOpen={() => setOnboardingOpen(true)}
          />
        );
      case "admin":
        return <AdminDashboard user={user} />;
      default:
        return (
          <CandidateDashboard
            user={user}
            profile={profile as CandidateProfile}
            onOnboardingOpen={() => setOnboardingOpen(true)}
          />
        );
    }
  };

  return (
    <>
      {renderDashboard()}

      {/* Onboarding Dialog */}
      <OnboardingDialog
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        user={user}
        profile={profile}
      />

      {/* Toast Notification for skipped onboarding */}
      <AnimatePresence>
        {showSkippedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-40 max-w-sm glass border border-amber-500/30 rounded-2xl p-4.5 shadow-2xl flex items-start gap-3.5 bg-neutral-50/90 dark:bg-neutral-950/80"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 space-y-1 text-left">
              <h4 className="text-xs font-bold text-foreground pr-4">Profile is Incomplete</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Complete your target profile now to enable active AI job matchmaking and ATS scoring.
              </p>
              <button
                onClick={() => setOnboardingOpen(true)}
                className="text-[10px] text-indigo-500 hover:underline font-bold pt-1 block cursor-pointer"
              >
                Complete Profile &rarr;
              </button>
            </div>
            <button
              onClick={() => setToastDismissed(true)}
              className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
