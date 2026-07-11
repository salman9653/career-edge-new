import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { MoreClient } from "@/components/dashboard/common/more-client";
import { User } from "@/types";

export default async function MorePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  let profile = null;
  if (user.accountType === "company") {
    const { getProfile } = await import("@/lib/dal");
    profile = await getProfile(user.id, user.accountType);
  }

  return <MoreClient user={user as User} profile={profile} />;
}
