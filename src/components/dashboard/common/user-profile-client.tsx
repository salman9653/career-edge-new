"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { User } from "@/types";
import {
  CandidateProfileDetails,
  CandidateProfileApplications,
  CompanyProfileDetails,
  CompanyProfileJobs
} from "@/components/dashboard/admin";
import { CandidateOwnProfile } from "@/components/dashboard/candidate";

interface UserProfileClientProps {
  profile: any;
  user: User;
}

export function UserProfileClient({ profile, user }: UserProfileClientProps) {
  const router = useRouter();
  const isCompany = user.accountType === "company";

  // Set TopBar details dynamically
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("My Profile", "Manage and preview your public and private profile details.");
    return () => clearHeader();
  }, []);

  return (
    <div className="w-full space-y-6 text-left pb-10">
      {/* Top Navigation & Edit Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass border border-neutral-200/40 dark:border-neutral-850/50 bg-neutral-50/20 dark:bg-[#07070b]/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <Button
          onClick={() => router.push("/dashboard/profile/edit")}
          variant="premium"
          size="sm"
          className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Main Profile Sections */}
      {isCompany ? (
        <div className="space-y-6">
          <CompanyProfileDetails company={profile} />
          <CompanyProfileJobs companyName={profile.companyName} jobs={profile.jobs} />
        </div>
      ) : (
        <div className="space-y-6">
          <CandidateOwnProfile candidate={profile} />
        </div>
      )}
    </div>
  );
}
