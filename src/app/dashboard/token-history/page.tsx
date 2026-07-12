import React from "react";
import { redirect } from "next/navigation";
import { getSession, getProfile, getCompanyTransactions } from "@/lib/dal";
import { TokenHistoryClient } from "@/components/billing";

export default async function TokenHistoryPage() {
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

  // Load first page of ALL token transactions (not filtered for billing only)
  const { transactions, totalCount } = await getCompanyTransactions(user.id, 0, 10, false);

  return (
    <div className="w-full">
      <TokenHistoryClient
        initialTransactions={transactions}
        initialTotal={totalCount}
      />
    </div>
  );
}
