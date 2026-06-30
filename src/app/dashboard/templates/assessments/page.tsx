import React from "react";
import { getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import { AssessmentsClient } from "@/components/dashboard/company/assessments-client";

export default async function AssessmentsPage() {
  const user = await getCurrentUser();

  if (!user || user.accountType !== "company") {
    redirect("/dashboard");
  }

  return <AssessmentsClient user={user} />;
}
