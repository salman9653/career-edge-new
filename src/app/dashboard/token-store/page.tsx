import React from "react";
import { redirect } from "next/navigation";
import { getSession, getProfile, getPricingTiers } from "@/lib/dal";
import { TokenStoreClient } from "@/components/billing";

export default async function DashboardTokenStorePage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/signin");
  }

  const user = session.user;
  if (user.accountType !== "company" && user.accountType !== "candidate") {
    redirect("/dashboard");
  }

  const profile = await getProfile(user.id, user.accountType);
  if (!profile) {
    redirect("/dashboard");
  }

  const pricing = await getPricingTiers();
  const packs = pricing.filter((p: any) => p.type === "ai-token-pack");

  return (
    <div className="w-full">
      <TokenStoreClient
        packs={packs}
        profile={profile}
        accountType={user.accountType}
      />
    </div>
  );
}
