import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getCandidatesWithUsers } from "@/lib/dal";
import { ManageCandidatesClient } from "@/components/dashboard/admin";

export default async function ManageCandidatesPage() {
  const user = await getCurrentUser();

  // Role authorization check
  if (!user || user.accountType !== "admin") {
    redirect("/dashboard");
  }

  const candidates = await getCandidatesWithUsers();

  return <ManageCandidatesClient candidates={candidates} />;
}
