"use client"

import React, { use } from "react"
import { UnderDevelopmentModule } from "@/components/dashboard/common/under-development"
import { authClient } from "@/lib/auth-client"

interface PageProps {
  params: Promise<{
    module: string
  }>
}

export default function DashboardModulePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const moduleName = resolvedParams.module
  const { data: session } = authClient.useSession()
  const user = session?.user

  // Resolve Title for "Under Development" content card
  const getModuleTitle = () => {
    const titleMap: Record<string, string> = {
      ats: "Application Tracking System",
      crm: "Candidate Relation managment",
      templates: "Templates",
      questions: "Question Bank",
      companies: "Manage Companies",
      candidates: "Manage Candidates",
      app: "Manage App",
      applications: "My Applications",
      practice: "Practice"
    }

    if (moduleName === "jobs") {
      return user?.accountType === "company" ? "Posted Jobs" : "Jobs Search"
    }

    return titleMap[moduleName] || moduleName.replace("-", " ")
  }

  return <UnderDevelopmentModule title={getModuleTitle()} />
}
