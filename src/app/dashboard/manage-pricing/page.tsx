import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ManagePricingClient } from "@/components/dashboard/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Pricing",
  description: "Configure subscription plans, offerings, and token limits.",
};

export default async function ManagePricingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || session.user.accountType !== "admin") {
    redirect("/dashboard");
  }

  // Load pricing plans and payments directly from the database on the server
  let pricingData = [];
  let paymentsData = [];
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const pricing = await db.collection("pricing").find({}).toArray();
    pricingData = JSON.parse(JSON.stringify(pricing));

    const payments = await db.collection("payments").find({}).sort({ createdAt: -1 }).toArray();
    paymentsData = JSON.parse(JSON.stringify(payments));
  } catch (err) {
    console.error("Failed to load admin app data on server:", err);
  }

  return <ManagePricingClient initialPricing={pricingData} initialPayments={paymentsData} />;
}
