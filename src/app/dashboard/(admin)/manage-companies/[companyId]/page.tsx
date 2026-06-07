import React from "react";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser, getCompanyDetails } from "@/lib/dal";
import { CompanyProfileClient } from "@/components/dashboard/admin";

interface PageProps {
  params: Promise<{
    companyId: string;
  }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  // Role authorization check
  if (!user || user.accountType !== "admin") {
    redirect("/dashboard");
  }

  // Await async routing parameters (Next.js 16.2 convention)
  const { companyId } = await params;
  const company = await getCompanyDetails(companyId);

  if (!company) {
    notFound();
  }

  return <CompanyProfileClient company={company} />;
}
