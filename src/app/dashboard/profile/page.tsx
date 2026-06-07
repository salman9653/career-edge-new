import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getCandidateDetails, getCompanyDetails, getAdminDetails } from "@/lib/dal";
import { UserProfileClient } from "@/components/dashboard/common/user-profile-client";
import { AdminProfileClient } from "@/components/dashboard/admin/admin-profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  if (user.accountType === "admin") {
    const adminDetails = await getAdminDetails(user.id);
    if (!adminDetails) redirect("/dashboard");
    return <AdminProfileClient adminDetails={adminDetails} user={user} />;
  }

  if (user.accountType === "candidate") {
    const candidateDetails = await getCandidateDetails(user.id);
    if (!candidateDetails) redirect("/dashboard");
    return <UserProfileClient profile={candidateDetails} user={user} />;
  }

  if (user.accountType === "company") {
    const companyDetails = await getCompanyDetails(user.id);
    if (!companyDetails) redirect("/dashboard");
    return <UserProfileClient profile={companyDetails} user={user} />;
  }

  redirect("/dashboard");
}
