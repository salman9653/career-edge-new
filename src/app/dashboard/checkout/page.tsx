import React from "react";
import { redirect } from "next/navigation";
import { getSession, getProfile, getPricingTiers } from "@/lib/dal";
import { CheckoutClient } from "@/components/billing";

interface CheckoutPageProps {
  searchParams: Promise<{ itemId?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/signin");
  }

  const { itemId } = await searchParams;
  if (!itemId) {
    redirect("/dashboard");
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

  // Fetch the selected pricing configuration
  const pricing = await getPricingTiers();
  const pricingItem = pricing.find((item: any) => item.id === itemId);

  if (!pricingItem) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full">
      <CheckoutClient
        item={pricingItem}
        user={user}
        profile={profile}
      />
    </div>
  );
}
