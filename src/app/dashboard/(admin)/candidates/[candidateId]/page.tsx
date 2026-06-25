import React from "react";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser, getCandidateDetails } from "@/lib/dal";
import { CandidateProfileClient } from "@/components/dashboard/admin";
import { dummyCandidates } from "@/dummy-data/admin-manage_candidates_table";

interface PageProps {
  params: Promise<{
    candidateId: string;
  }>;
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  // Role authorization check
  if (!user || user.accountType !== "admin") {
    redirect("/dashboard");
  }

  // Await async routing parameters (Next.js 16.2 convention)
  const { candidateId } = await params;
  let candidate = await getCandidateDetails(candidateId);

  if (!candidate) {
    notFound();
  }

  return <CandidateProfileClient candidate={candidate} />;
}
