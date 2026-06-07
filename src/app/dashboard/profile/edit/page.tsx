import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getCandidateDetails, getCompanyDetails, getAdminDetails } from "@/lib/dal";
import { EditProfileClient } from "@/components/dashboard/common/edit-profile-client";

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  let profileData: any = null;

  if (user.accountType === "admin") {
    profileData = await getAdminDetails(user.id);
  } else if (user.accountType === "candidate") {
    profileData = await getCandidateDetails(user.id);
  } else if (user.accountType === "company") {
    profileData = await getCompanyDetails(user.id);
  }

  if (!profileData) {
    redirect("/dashboard");
  }

  return <EditProfileClient profile={profileData} user={user} />;
}
