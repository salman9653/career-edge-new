"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { User } from "@/types";
import { EditCandidateProfileForm } from "../candidate/edit-candidate-profile-form";
import { EditCompanyProfileForm } from "../company/edit-company-profile-form";
import { EditAdminProfileForm } from "../admin/edit-admin-profile-form";

interface EditProfileClientProps {
  profile: any;
  user: User;
}

export function EditProfileClient({ profile, user }: EditProfileClientProps) {
  const router = useRouter();

  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("Edit Profile", "Update your registered account credentials, attributes, and details.");
    return () => clearHeader();
  }, []);

  const renderForm = () => {
    switch (user.accountType) {
      case "candidate":
        return <EditCandidateProfileForm initialProfile={profile} name={user.name} />;
      case "company":
        return <EditCompanyProfileForm initialProfile={profile} />;
      case "admin":
        return <EditAdminProfileForm initialProfile={profile} />;
      default:
        return <p className="text-xs text-muted-foreground p-6">Invalid account profile type.</p>;
    }
  };

  return (
    <div className="w-full space-y-6 text-left pb-10">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass border border-neutral-200/40 dark:border-neutral-850/50 bg-neutral-50/20 dark:bg-[#07070b]/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/profile")}
          className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Button>
      </div>

      {/* Form Container */}
      <div className="w-full">
        {renderForm()}
      </div>
    </div>
  );
}
