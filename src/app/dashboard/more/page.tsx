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

  return <MoreClient user={user as User} />;
}
