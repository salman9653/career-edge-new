import React, { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { User } from "@/types";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/signin");
  }

  const { user } = session;
  let profile = null;

  if (user.accountType && user.accountType !== "unselected") {
    try {
      const client = await clientPromise;
      const db = client.db();
      const collectionName = user.accountType === "company" ? "company_profiles" : "candidate_profiles";
      profile = await db.collection(collectionName).findOne({ userId: user.id });
      // Serialize profile object for Next.js props (e.g. converting MongoDB ObjectId)
      if (profile) {
        profile = JSON.parse(JSON.stringify(profile));
      }
    } catch (err) {
      console.error("Failed to load user profile in layout:", err);
    }
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      }
    >
      <DashboardLayoutClient user={user as User} profile={profile}>
        {children}
      </DashboardLayoutClient>
    </Suspense>
  );
}
