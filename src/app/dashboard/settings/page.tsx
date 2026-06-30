import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { SettingsPageClient } from "@/components/dashboard/common/settings/settings-page-client";
import { User } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and app preferences.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return <SettingsPageClient user={user as User} />;
}
