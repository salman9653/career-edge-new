import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ManageAppClient } from "@/components/dashboard/admin/manage-app-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage App",
  description: "Configure subscription plans, offerings, and token limits.",
};

export default async function ManageAppPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || session.user.accountType !== "admin") {
    redirect("/dashboard");
  }

  // Load pricing plans directly from the database on the server
  let pricingData = [];
  try {
    const client = await clientPromise;
    const db = client.db();
    const data = await db.collection("pricing").find({}).toArray();
    pricingData = JSON.parse(JSON.stringify(data));
  } catch (err) {
    console.error("Failed to load pricing data on server:", err);
  }

  return <ManageAppClient initialPricing={pricingData} />;
}
