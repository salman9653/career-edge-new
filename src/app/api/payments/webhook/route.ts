import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import clientPromise from "@/lib/db";

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const signature = headerList.get("x-razorpay-signature");
    
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not defined in environment variables");
      return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 });
    }

    // 1. Verify Razorpay webhook authenticity
    const rawBody = await request.text();
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Webhook validation signature mismatch");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // 2. Parse event payload
    const eventData = JSON.parse(rawBody);
    const eventName = eventData.event;
    const subscriptionEntity = eventData.payload?.subscription?.entity;

    if (!subscriptionEntity) {
      // Event doesn't relate to a subscription directly
      return NextResponse.json({ success: true, message: "Ignored non-subscription webhook event" }, { status: 200 });
    }

    const subscriptionId = subscriptionEntity.id;
    const client = await clientPromise;
    const db = client.db();

    // 3. Find profile by subscription ID (searching in both candidate and company collections)
    let profile = await db.collection("candidate_profiles").findOne({ "subscription.subscriptionId": subscriptionId });
    let collectionName = "candidate_profiles";
    let accountType: "candidate" | "company" = "candidate";

    if (!profile) {
      profile = await db.collection("company_profiles").findOne({ "subscription.subscriptionId": subscriptionId });
      collectionName = "company_profiles";
      accountType = "company";
    }

    if (!profile) {
      console.warn(`Webhook subscription: Profile not found for subscription ID ${subscriptionId}`);
      // Return 200 to acknowledge receipt to Razorpay, preventing persistent retries
      return NextResponse.json({ success: true, message: "Subscription record not found in DB" }, { status: 200 });
    }

    const userId = profile.userId;

    // 4. Handle events
    if (eventName === "subscription.charged") {
      const { current_start, current_end, plan_id } = subscriptionEntity;
      
      const currentPeriodStart = new Date(current_start * 1000);
      const currentPeriodEnd = new Date(current_end * 1000);

      // Find the pricing configuration
      const pricingItem = await db.collection("pricing").findOne({ id: profile.activePlan });
      const newAllocated = pricingItem?.monthlyTokens ?? (accountType === "company" ? 15 : 5);
      const currentPurchased = profile.aiTokens?.purchased ?? 0;
      const newTotal = newAllocated + currentPurchased;

      // Update user subscription period dates and refill monthly tokens
      await db.collection(collectionName).updateOne(
        { userId },
        {
          $set: {
            "subscription.status": "active",
            "subscription.currentPeriodStart": currentPeriodStart,
            "subscription.currentPeriodEnd": currentPeriodEnd,
            "aiTokens.allocated": newAllocated,
            "aiTokens.total": newTotal,
            "aiTokens.lastRefilledAt": new Date(),
            updatedAt: new Date()
          }
        }
      );

      // Log transaction
      await db.collection("token_transactions").insertOne({
        companyId: userId,
        amount: newAllocated,
        balanceAfter: newTotal,
        type: "refill",
        description: `Subscription renewed - Monthly refill of ${newAllocated} credits`,
        razorpaySubscriptionId: subscriptionId,
        createdAt: new Date()
      });

      // Save payment transaction record
      const invoice = eventData.payload?.payment?.entity;
      await db.collection("payments").insertOne({
        userId,
        userEmail: profile.email || "",
        userName: profile.name || "",
        accountType,
        itemId: profile.activePlan,
        itemName: pricingItem?.name || "Premium Subscription",
        basePrice: pricingItem?.price || 0,
        gstAmount: 0,
        discountAmount: 0,
        amountPaid: pricingItem?.price || 0,
        couponCode: "",
        razorpaySubscriptionId: subscriptionId,
        razorpayPaymentId: invoice?.id || "recurring_auto_charge",
        status: "captured",
        createdAt: new Date()
      });

      console.log(`[Webhook] subscription.charged processed successfully for user ${userId}`);

    } else if (eventName === "subscription.cancelled") {
      // Revert plan to Free Tier
      const freePlanId = accountType === "company" ? "company-free" : "candidate-free";
      const freePricing = await db.collection("pricing").findOne({ id: freePlanId });
      
      const newAllocated = freePricing?.monthlyTokens ?? (accountType === "company" ? 15 : 5);
      const currentPurchased = profile.aiTokens?.purchased ?? 0;
      const newTotal = newAllocated + currentPurchased;

      await db.collection(collectionName).updateOne(
        { userId },
        {
          $set: {
            activePlan: freePlanId,
            "subscription.status": "cancelled",
            "subscription.cancelAtPeriodEnd": false,
            "aiTokens.allocated": newAllocated,
            "aiTokens.total": newTotal,
            updatedAt: new Date()
          }
        }
      );

      // Log transaction
      await db.collection("token_transactions").insertOne({
        companyId: userId,
        amount: 0,
        balanceAfter: newTotal,
        type: "downgrade",
        description: "Subscription expired - Downgraded to Free Tier",
        razorpaySubscriptionId: subscriptionId,
        createdAt: new Date()
      });

      console.log(`[Webhook] subscription.cancelled processed successfully for user ${userId}`);

    } else if (eventName === "subscription.halted") {
      // Suspend billing state, but maintain active plan index or mark as unpaid/halted
      await db.collection(collectionName).updateOne(
        { userId },
        {
          $set: {
            "subscription.status": "halted",
            updatedAt: new Date()
          }
        }
      );

      console.log(`[Webhook] subscription.halted processed successfully for user ${userId}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Webhook processing failure:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
