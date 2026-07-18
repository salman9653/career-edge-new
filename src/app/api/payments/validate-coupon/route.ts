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

    const body = await request.json();
    const { code, itemId, priceAfterOffer } = body;

    if (!code || !itemId || priceAfterOffer === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: code, itemId, or priceAfterOffer" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const now = new Date();

    // Look up coupon case-insensitively
    const coupon = await db.collection("promotions").findOne({
      type: "coupon",
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    // 1. Check active status
    if (!coupon.active) {
      return NextResponse.json({ error: "This coupon is currently inactive" }, { status: 400 });
    }

    // 2. Check date windows
    const startDate = new Date(coupon.startDate);
    const expiresAt = new Date(coupon.expiresAt);
    if (now < startDate) {
      return NextResponse.json({ error: "This coupon promotion has not started yet" }, { status: 400 });
    }
    if (now > expiresAt) {
      return NextResponse.json({ error: "This coupon code has expired" }, { status: 400 });
    }

    // 3. Check global redemption limits
    if (coupon.maxTotalRedemptions !== undefined && coupon.maxTotalRedemptions !== null) {
      if (coupon.currentTotalRedemptions >= coupon.maxTotalRedemptions) {
        return NextResponse.json({ error: "This coupon redemption limit has been reached" }, { status: 400 });
      }
    }

    // 4. Check per-user limits
    const userRedemptions = await db.collection("payments").countDocuments({
      userId: session.user.id,
      couponCode: coupon.code,
    });

    const userLimit = coupon.limitPerUser || 1;
    if (userRedemptions >= userLimit) {
      return NextResponse.json({ error: "You have already used this coupon code" }, { status: 400 });
    }

    // 5. Check item eligibility (appliesTo list matching)
    const isEligible = coupon.appliesTo && coupon.appliesTo.includes(itemId);
    if (!isEligible) {
      return NextResponse.json({ error: "This coupon code is not applicable to the selected plan" }, { status: 400 });
    }

    // 6. Check minimum order value threshold
    const minVal = coupon.minOrderValue || 0;
    if (priceAfterOffer < minVal) {
      return NextResponse.json(
        { error: `Minimum order value of ₹${minVal} required for this coupon (current price: ₹${priceAfterOffer})` },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.benefitType === "percentage") {
      discountAmount = Math.round(priceAfterOffer * (coupon.discountValue / 100));
    } else if (coupon.benefitType === "fixed-discount") {
      discountAmount = Math.min(priceAfterOffer, coupon.discountValue);
    }

    return NextResponse.json(
      {
        valid: true,
        couponCode: coupon.code,
        benefitType: coupon.benefitType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("POST /api/payments/validate-coupon error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
