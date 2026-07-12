import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Razorpay from "razorpay";
import { ObjectId } from "mongodb";
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

    const body = await request.json();
    const { itemId, couponCode } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials missing in environment");
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Fetch pricing detail from DB
    const pricingItem = await db.collection("pricing").findOne({ id: itemId });
    if (!pricingItem) {
      return NextResponse.json({ error: "Pricing plan not found" }, { status: 404 });
    }

    const price = pricingItem.price;
    let discount = 0;
    if (couponCode === "SAVE10" || couponCode === "WELCOME10") {
      discount = 0.10;
    }
    const appliedDiscount = Math.round(price * discount);
    const discountedPrice = price - appliedDiscount;
    const gstAmount = Math.round(discountedPrice * 0.18);
    const grandTotal = discountedPrice + gstAmount;

    if (grandTotal <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create Razorpay Order (amount is in paise, e.g. Rs 1 = 100 paise)
    const amountInPaise = Math.round(grandTotal * 100);
    const receiptId = new ObjectId().toString();
    
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId: session.user.id,
        itemId: itemId,
        accountType: session.user.accountType,
        couponCode: couponCode || "",
        discountAmount: appliedDiscount.toString(),
        gstAmount: gstAmount.toString(),
        basePrice: price.toString(),
        grandTotal: grandTotal.toString(),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    }, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/payments/create-order error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
