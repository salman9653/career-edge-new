import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.accountType !== "company") {
      return NextResponse.json({ error: "Only company accounts can manage subscription plans" }, { status: 403 });
    }

    const body = await request.json();
    const { planId } = body;

    const validPlans = ["company-free", "company-pro", "company-pro-plus"];
    if (!validPlans.includes(planId)) {
      return NextResponse.json({ error: "Invalid plan identifier" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch new plan benefits
    const planConfig = await db.collection("pricing").findOne({ id: planId });
    if (!planConfig) {
      return NextResponse.json({ error: "Selected plan configuration not found" }, { status: 404 });
    }

    const profile = await db.collection("company_profiles").findOne({ userId: session.user.id });
    if (!profile) {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }

    const currentAllocated = profile.aiTokens?.allocated ?? 0;
    const currentPurchased = profile.aiTokens?.purchased ?? 0;
    
    // Set new allocated to plan's limit, and re-sum total
    const newAllocated = planConfig.monthlyTokens ?? 15;
    const newTotal = newAllocated + currentPurchased;

    await db.collection("company_profiles").updateOne(
      { userId: session.user.id },
      {
        $set: {
          activePlan: planId,
          "aiTokens.allocated": newAllocated,
          "aiTokens.total": newTotal,
          "aiTokens.lastRefilledAt": new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Log transaction
    await db.collection("token_transactions").insertOne({
      companyId: session.user.id,
      amount: newAllocated,
      balanceAfter: newTotal,
      type: "upgrade",
      description: `Upgraded subscription to ${planConfig.name} (Mock Checkout)`,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, activePlan: planId, totalTokens: newTotal });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/payments/mock-upgrade error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
