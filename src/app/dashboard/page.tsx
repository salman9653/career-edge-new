import React, { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { User } from "@/types";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/signin");
  }

  const { user } = session;

  if (user.accountType === "unselected") {
    redirect("/dashboard");
  }

  let profile = null;

  try {
    const client = await clientPromise;
    const db = client.db();
    const collectionName = user.accountType === "company" ? "company_profiles" : "candidate_profiles";
    
    if (user.accountType === "company") {
      const { checkAndRefillTokens } = await import("@/lib/dal");
      await checkAndRefillTokens(user.id);
    }
    
    profile = await db.collection(collectionName).findOne({ userId: user.id });
    if (profile) {
      profile = JSON.parse(JSON.stringify(profile));
    }
  } catch (err) {
    console.error("Failed to load profile in dashboard page:", err);
  }

  return (
    <Suspense fallback={null}>
      <DashboardClient user={user as User} profile={profile} />
    </Suspense>
  );
}
