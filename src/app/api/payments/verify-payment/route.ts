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
      razorpay_order_id, 
      razorpay_signature, 
      itemId 
    } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !itemId) {
      return NextResponse.json({ error: "Missing required verification fields" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("Razorpay keys missing in environment");
      return NextResponse.json({ error: "Payment verification error" }, { status: 500 });
    }

    // 1. Verify Razorpay signature using SHA-256 HMAC
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("Invalid payment signature mismatch:", {
        expected: expectedSignature,
        received: razorpay_signature
      });
      return NextResponse.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
    }

    // Fetch order details from Razorpay to read verified pricing and notes
    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    const rzpOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
    const rzpNotes = rzpOrder.notes || {};

    const basePrice = parseFloat(rzpNotes.basePrice || "0");
    const gstAmount = parseFloat(rzpNotes.gstAmount || "0");
    const discountAmount = parseFloat(rzpNotes.discountAmount || "0");
    const grandTotal = parseFloat(rzpNotes.grandTotal || "0");
    const couponCode = rzpNotes.couponCode || "";
    const appliedOffer = rzpNotes.appliedOffer || "";

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

    // 3. Fetch pricing detail from DB
    const pricingItem = await db.collection("pricing").findOne({ id: itemId });
    if (!pricingItem) {
      return NextResponse.json({ error: "Pricing item config not found" }, { status: 404 });
    }

    const currentAllocated = profile.aiTokens?.allocated ?? (accountType === "company" ? 15 : 5);
    const currentPurchased = profile.aiTokens?.purchased ?? 0;
    
    let newTotal = currentAllocated + currentPurchased;

    if (pricingItem.type === "base-plan") {
      // Base plan upgrade
      const newAllocated = pricingItem.monthlyTokens ?? (accountType === "company" ? 15 : 5);
      newTotal = newAllocated + currentPurchased;

      await db.collection(collectionName).updateOne(
        { userId },
        {
          $set: {
            activePlan: itemId,
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
        type: "upgrade",
        description: `Upgraded subscription to ${pricingItem.name}`,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        createdAt: new Date()
      });

    } else if (pricingItem.type === "ai-token-pack") {
      // Token pack purchase
      const addedTokens = pricingItem.tokensCount ?? 0;
      const newPurchased = currentPurchased + addedTokens;
      newTotal = currentAllocated + newPurchased;

      await db.collection(collectionName).updateOne(
        { userId },
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
        companyId: userId,
        amount: addedTokens,
        balanceAfter: newTotal,
        type: "purchase",
        description: `Purchased ${pricingItem.name} - ${addedTokens} credits`,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        createdAt: new Date()
      });
    }

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

    // Save payment details in the database "payments" collection
    await db.collection("payments").insertOne({
      userId,
      userEmail: session.user.email,
      userName: session.user.name,
      accountType,
      itemId,
      itemName: pricingItem.name,
      basePrice,
      gstAmount,
      discountAmount,
      amountPaid: grandTotal,
      couponCode,
      appliedOffer,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "captured",
      createdAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      activePlan: pricingItem.type === "base-plan" ? itemId : profile.activePlan, 
      totalTokens: newTotal,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amountPaid: grandTotal
    }, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/payments/verify-payment error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
