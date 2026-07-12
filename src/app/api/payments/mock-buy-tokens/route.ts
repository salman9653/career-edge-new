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

    const accountType = session.user.accountType;
    if (accountType !== "company" && accountType !== "candidate") {
      return NextResponse.json({ error: "Only company or candidate accounts can purchase tokens" }, { status: 403 });
    }

    const body = await request.json();
    const { packId } = body;

    const client = await clientPromise;
    const db = client.db();

    // Fetch token pack config
    const packConfig = await db.collection("pricing").findOne({ id: packId, type: "ai-token-pack" });
    if (!packConfig) {
      return NextResponse.json({ error: "Token package not found" }, { status: 404 });
    }

    const collectionName = accountType === "company" ? "company_profiles" : "candidate_profiles";
    const profile = await db.collection(collectionName).findOne({ userId: session.user.id });
    if (!profile) {
      return NextResponse.json({ error: `${accountType === "company" ? "Company" : "Candidate"} profile not found` }, { status: 404 });
    }

    const currentAllocated = profile.aiTokens?.allocated ?? (accountType === "company" ? 15 : 5);
    const currentPurchased = profile.aiTokens?.purchased ?? 0;
    const addedTokens = packConfig.tokensCount ?? 0;
    
    const newPurchased = currentPurchased + addedTokens;
    const newTotal = currentAllocated + newPurchased;

    await db.collection(collectionName).updateOne(
      { userId: session.user.id },
      {
        $set: {
          "aiTokens.purchased": newPurchased,
          "aiTokens.total": newTotal,
          updatedAt: new Date()
        }
      }
    );

    // Log transaction
    await db.collection("token_transactions").insertOne({
      companyId: session.user.id,
      amount: addedTokens,
      balanceAfter: newTotal,
      type: "purchase",
      description: `Purchased ${packConfig.name} - ${addedTokens} credits (Mock Checkout)`,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, totalTokens: newTotal });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/payments/mock-buy-tokens error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
