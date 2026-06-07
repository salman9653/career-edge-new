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

  // Fallback to dummy data lookup for testing purposes
  if (!candidate) {
    const dummy = dummyCandidates.find((d) => d.id === candidateId);
    if (dummy) {
      candidate = {
        ...dummy,
        bio: `${dummy.name} is a seasoned professional in the field of technology, currently working as a ${dummy.jobTitle}. With experience at various levels of complexity, they are looking to take the next big step in their career.`,
        phone: "+1 (555) 019-2834",
        skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Node.js", "Git"],
        linkedin: `linkedin.com/in/${dummy.name.toLowerCase().replace(/\s+/g, "-")}`,
        github: `github.com/${dummy.name.toLowerCase().replace(/\s+/g, "")}`,
        twitter: `@${dummy.name.toLowerCase().replace(/\s+/g, "")}`,
        applications: [],
      };
    }
  }

  if (!candidate) {
    notFound();
  }

  return <CandidateProfileClient candidate={candidate} />;
}
