import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_signature, 
      itemId 
    } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature || !itemId) {
      return NextResponse.json({ error: "Missing required subscription verification fields" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("Razorpay credentials missing in environment");
      return NextResponse.json({ error: "Payment verification error" }, { status: 500 });
    }

    // 1. Verify Razorpay subscription payment signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("Subscription signature mismatch:", {
        expected: expectedSignature,
        received: razorpay_signature
      });
      return NextResponse.json({ error: "Subscription signature verification failed" }, { status: 400 });
    }

    // Fetch subscription details from Razorpay to read notes
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }) as any;

    const rzpSub = await razorpay.subscriptions.fetch(razorpay_subscription_id);
    const rzpNotes = rzpSub.notes || {};

    const basePrice = parseFloat(rzpNotes.basePrice || "0");
    const discountAmount = parseFloat(rzpNotes.discountAmount || "0");
    const grandTotal = parseFloat(rzpNotes.grandTotal || "0");
    const couponCode = rzpNotes.couponCode || "";
    const appliedOffer = rzpNotes.appliedOffer || "";
    const extraMonths = parseInt(rzpNotes.extraMonths || "0", 10);

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;
    const accountType = session.user.accountType;
    const collectionName = accountType === "company" ? "company_profiles" : "candidate_profiles";

    // 2. Fetch profile
    const profile = await db.collection(collectionName).findOne({ userId });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Fetch pricing config from DB
    const pricingItem = await db.collection("pricing").findOne({ id: itemId });
    if (!pricingItem) {
      return NextResponse.json({ error: "Pricing item config not found" }, { status: 404 });
    }

    // 4. Calculate period end date (+1 month or +1 year)
    const isYearly = itemId.endsWith("-yearly");
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    if (isYearly) {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Apply promotion extraMonths if present
    if (extraMonths > 0) {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + extraMonths);
    }

    const currentPurchased = profile.aiTokens?.purchased ?? 0;
    const newAllocated = pricingItem.monthlyTokens ?? (accountType === "company" ? 15 : 5);
    const newTotal = newAllocated + currentPurchased;

    // 5. Update user profile database record
    await db.collection(collectionName).updateOne(
      { userId },
      {
        $set: {
          activePlan: itemId,
          subscription: {
            subscriptionId: razorpay_subscription_id,
            planId: pricingItem.id,
            status: "active",
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: false
          },
          "aiTokens.allocated": newAllocated,
          "aiTokens.total": newTotal,
          "aiTokens.lastRefilledAt": new Date(),
          updatedAt: new Date()
        }
      }
    );

    // 6. Log transaction
    await db.collection("token_transactions").insertOne({
      companyId: userId,
      amount: newAllocated,
      balanceAfter: newTotal,
      type: "upgrade",
      description: `Subscribed to ${pricingItem.name}`,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayPaymentId: razorpay_payment_id,
      createdAt: new Date()
    });

    // Increment promotions redemptions
    if (couponCode) {
      await db.collection("promotions").updateOne(
        { type: "coupon", code: couponCode },
        { $inc: { currentTotalRedemptions: 1 } }
      );
    }
    if (appliedOffer) {
      await db.collection("promotions").updateOne(
        { _id: new ObjectId(appliedOffer) },
        { $inc: { currentTotalRedemptions: 1 } }
      );
    }

    // 7. Save payment record
    await db.collection("payments").insertOne({
      userId,
      userEmail: session.user.email,
      userName: session.user.name,
      accountType,
      itemId,
      itemName: pricingItem.name,
      basePrice: basePrice || pricingItem.price,
      gstAmount: 0,
      discountAmount,
      amountPaid: grandTotal || pricingItem.price,
      couponCode,
      appliedOffer,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "captured",
      createdAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      activePlan: itemId, 
      totalTokens: newTotal,
      paymentId: razorpay_payment_id,
      subscriptionId: razorpay_subscription_id,
    }, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/payments/verify-subscription error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
