"use client";

import React, { useEffect } from "react";
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
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader(
      "Edit Profile",
      "Update your registered account credentials, attributes, and details.",
      "/dashboard/profile"
    );
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
      {/* Form Container */}
      <div className="w-full">
        {renderForm()}
      </div>
    </div>
  );
}
