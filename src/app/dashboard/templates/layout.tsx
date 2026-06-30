import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { TemplatesLayoutClient } from "@/components/dashboard/company/templates-layout-client";

export default async function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Role authorization check
  if (!user || user.accountType !== "company") {
    redirect("/dashboard");
  }

  return (
    <TemplatesLayoutClient user={user}>
      {children}
    </TemplatesLayoutClient>
  );
}
