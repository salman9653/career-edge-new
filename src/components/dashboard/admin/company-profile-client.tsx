"use client";

import React, { useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";
import { CompanyProfileDetails } from "./company-profile-details";
import { CompanyProfileJobs } from "./company-profile-jobs";

interface JobRow {
  id?: string;
  title: string;
  type: string;
  positions: number;
  status: string;
  postedOn: string;
}

interface CompanyDetails {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  location: string;
  websiteUrl?: string;
  companySize?: string;
  companyType?: string;
  subscription?: string;
  status?: string;
  memberSince?: string;
  email?: string;
  image?: string | null;
  founded?: string;
  about?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  jobs?: JobRow[];
}

interface CompanyProfileClientProps {
  company: CompanyDetails;
}

export function CompanyProfileClient({ company }: CompanyProfileClientProps) {
  // Set TopBar details dynamically with back button pointing to Manage Companies
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("Company Profile", undefined, "/dashboard/manage-companies");
    return () => clearHeader();
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Main Glass Profile Card Details */}
      <CompanyProfileDetails company={company} showCollapse={true} />

      {/* Associated Job Postings Table */}
      <CompanyProfileJobs companyName={company.companyName} jobs={company.jobs} />
    </div>
  );
}
