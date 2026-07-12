import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UnderDevelopmentModule } from "@/components/dashboard/common/under-development";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage App",
  description: "Configure system preferences and application integrations.",
};

export default async function ManageAppPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || session.user.accountType !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <UnderDevelopmentModule title="Manage App" />
    </div>
  );
}
