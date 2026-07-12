import React from "react";
import { redirect } from "next/navigation";
import { getSession, getProfile, getPricingTiers } from "@/lib/dal";
import { UpgradeClient } from "@/components/billing";

export default async function DashboardUpgradePage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/signin");
  }

  const user = session.user;
  const accountType = user.accountType;

  if (accountType !== "company" && accountType !== "candidate") {
    redirect("/dashboard");
  }

  const profile = await getProfile(user.id, accountType);
  if (!profile) {
    redirect("/dashboard");
  }

  const pricing = await getPricingTiers();
  const plans = pricing.filter((p: any) => p.type === "base-plan" && p.target === accountType);
  const activePlanId = profile.activePlan || (accountType === "company" ? "company-free" : "candidate-free");

  return (
    <div className="w-full">
      <UpgradeClient
        plans={plans}
        activePlanId={activePlanId}
        accountType={accountType}
      />
    </div>
  );
}
