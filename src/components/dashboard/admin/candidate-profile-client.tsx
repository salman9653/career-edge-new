"use client";

import React, { useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";
import { CandidateProfileDetails } from "./candidate-profile-details";
import { CandidateProfileApplications } from "./candidate-profile-applications";

interface ApplicationRow {
  id?: string;
  jobTitle: string;
  employerName: string;
  appliedDate: string;
  status: string;
}

interface CandidateDetails {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  jobTitle: string;
  experience: string;
  status: string;
  memberSince: string;
  bio?: string;
  phone?: string;
  skills?: string[];
  linkedin?: string;
  github?: string;
  twitter?: string;
  applications?: ApplicationRow[];
}

interface CandidateProfileClientProps {
  candidate: CandidateDetails;
}

export function CandidateProfileClient({ candidate }: CandidateProfileClientProps) {
  // Set TopBar details dynamically with back button pointing to Manage Candidates
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("Candidate Profile", undefined, "/dashboard/candidates");
    return () => clearHeader();
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Main Glass Profile Card Details */}
      <CandidateProfileDetails candidate={candidate} />

      {/* Associated Applications Table */}
      {candidate.applications && candidate.applications.length > 0 && (
        <CandidateProfileApplications 
          candidateName={candidate.name} 
          applications={candidate.applications} 
        />
      )}
    </div>
  );
}
