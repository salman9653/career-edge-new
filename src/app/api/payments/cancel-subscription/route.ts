import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials missing in environment");
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;
    const accountType = session.user.accountType;
    const collectionName = accountType === "company" ? "company_profiles" : "candidate_profiles";

    // 1. Fetch user's profile to find active subscription ID
    const profile = await db.collection(collectionName).findOne({ userId });
    if (!profile || !profile.subscription || !profile.subscription.subscriptionId) {
      return NextResponse.json({ error: "No active subscription found to cancel" }, { status: 400 });
    }

    const subscriptionId = profile.subscription.subscriptionId;

    // 2. Initialize Razorpay and trigger cancellation at cycle end
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }) as any;

    await razorpay.subscriptions.cancel(subscriptionId, {
      cancel_at_cycle_end: true, // Let them use their remaining paid duration
    });

    // 3. Update database record status
    await db.collection(collectionName).updateOne(
      { userId },
      {
        $set: {
          "subscription.status": "canceling",
          "subscription.cancelAtPeriodEnd": true,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Subscription set to cancel at the end of current billing cycle." 
    }, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/payments/cancel-subscription error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
