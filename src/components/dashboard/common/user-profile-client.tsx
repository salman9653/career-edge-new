"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { User } from "@/types";
import { CompanyProfileDetails } from "@/components/dashboard/admin";
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
      {/* Back to Dashboard */}
      <div className="flex justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-xl px-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      {/* Main Profile Sections */}
      {isCompany ? (
        <div className="space-y-6">
          <CompanyProfileDetails company={profile} isOwnProfile={true} />
        </div>
      ) : (
        <div className="space-y-6">
          <CandidateOwnProfile candidate={profile} emailVerified={user.emailVerified} />
        </div>
      )}
    </div>
  );
}
