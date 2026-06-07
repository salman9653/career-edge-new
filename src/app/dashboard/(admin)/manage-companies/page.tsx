import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getCompaniesWithUsers } from "@/lib/dal";
import { ManageCompaniesClient } from "@/components/dashboard/admin";

export default async function ManageCompaniesPage() {
  const user = await getCurrentUser();

  // Role authorization check
  if (!user || user.accountType !== "admin") {
    redirect("/dashboard");
  }

  const companies = await getCompaniesWithUsers();

  return <ManageCompaniesClient companies={companies} />;
}
