import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Razorpay from "razorpay";
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

    // Map base plan ID to the corresponding Razorpay Plan ID from environment variables
    let planId: string | undefined;
    switch (itemId) {
      case "candidate-pro":
        planId = process.env.NEXT_PUBLIC_CANDIDATE_PRO_MONTHLY_PLAN_ID;
        break;
      case "candidate-pro-yearly":
        planId = process.env.NEXT_PUBLIC_CANDIDATE_PRO_YEARLY_PLAN_ID;
        break;
      case "candidate-pro-plus":
        planId = process.env.NEXT_PUBLIC_CANDIDATE_PRO_PLUS_MONTHLY_PLAN_ID;
        break;
      case "candidate-pro-plus-yearly":
        planId = process.env.NEXT_PUBLIC_CANDIDATE_PRO_PLUS_YEARLY_PLAN_ID;
        break;
      case "company-pro":
        planId = process.env.NEXT_PUBLIC_COMPANY_PRO_MONTHLY_PLAN_ID;
        break;
      case "company-pro-yearly":
        planId = process.env.NEXT_PUBLIC_COMPANY_PRO_YEARLY_PLAN_ID;
        break;
      case "company-pro-plus":
        planId = process.env.NEXT_PUBLIC_COMPANY_PRO_PLUS_MONTHLY_PLAN_ID;
        break;
      case "company-pro-plus-yearly":
        planId = process.env.NEXT_PUBLIC_COMPANY_PRO_PLUS_YEARLY_PLAN_ID;
        break;
      default:
        return NextResponse.json({ error: `Invalid subscription plan itemId: ${itemId}` }, { status: 400 });
    }

    if (!planId) {
      console.error(`Razorpay Plan ID environment variable is missing for item: ${itemId}`);
      return NextResponse.json({ error: `Subscription Plan ID configuration error for item ${itemId}` }, { status: 500 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials missing in environment");
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
    }

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }) as any;

    // Subscriptions count (e.g. 10 years duration to simulate infinite recurring)
    const isYearly = itemId.endsWith("-yearly");
    const totalCount = isYearly ? 10 : 120;

    // Fetch pricing detail from DB
    const client = await clientPromise;
    const db = client.db();
    const pricingItem = await db.collection("pricing").findOne({ id: itemId });
    if (!pricingItem) {
      return NextResponse.json({ error: "Pricing plan not found" }, { status: 404 });
    }

    const price = pricingItem.price;

    // 1. Check for active auto-applied offers
    const now = new Date();
    const activeOffers = await db.collection("promotions").find({
      type: "offer",
      active: true,
      startDate: { $lte: now },
      expiresAt: { $gte: now },
      appliesTo: itemId
    }).toArray();

    let eligibleOffer = null;
    for (const offer of activeOffers) {
      if (offer.maxTotalRedemptions !== undefined && offer.currentTotalRedemptions >= offer.maxTotalRedemptions) {
        continue;
      }
      const userRedemptions = await db.collection("payments").countDocuments({
        userId: session.user.id,
        appliedOffer: offer._id.toString()
      });
      if (userRedemptions < (offer.limitPerUser || 1)) {
        eligibleOffer = offer;
        break; // apply the first matched eligible offer
      }
    }

    let offerDiscountAmount = 0;
    let priceAfterOffer = price;
    let appliedOfferId = "";
    let extraMonthsVal = 0;

    if (eligibleOffer) {
      appliedOfferId = eligibleOffer._id.toString();
      if (eligibleOffer.benefitType === "percentage") {
        offerDiscountAmount = Math.round(price * (eligibleOffer.discountValue / 100));
      } else if (eligibleOffer.benefitType === "fixed-discount") {
        offerDiscountAmount = Math.min(price, eligibleOffer.discountValue);
      } else if (eligibleOffer.benefitType === "extra-time") {
        extraMonthsVal = eligibleOffer.extraMonths || 0;
      }
      priceAfterOffer = price - offerDiscountAmount;
    }

    // 2. Check for manually entered coupon codes
    let couponDiscountAmount = 0;
    let appliedCouponCode = "";

    if (couponCode) {
      const coupon = await db.collection("promotions").findOne({
        type: "coupon",
        code: couponCode.trim().toUpperCase(),
        active: true,
        startDate: { $lte: now },
        expiresAt: { $gte: now },
        appliesTo: itemId
      });

      if (coupon) {
        const isWithinLimits = coupon.maxTotalRedemptions === undefined || coupon.currentTotalRedemptions < coupon.maxTotalRedemptions;
        const userRedemptions = await db.collection("payments").countDocuments({
          userId: session.user.id,
          couponCode: coupon.code
        });
        const isWithinUserLimits = userRedemptions < (coupon.limitPerUser || 1);
        const qualifiesMinOrder = priceAfterOffer >= (coupon.minOrderValue || 0);

        if (isWithinLimits && isWithinUserLimits && qualifiesMinOrder) {
          appliedCouponCode = coupon.code;
          if (coupon.benefitType === "percentage") {
            couponDiscountAmount = Math.round(priceAfterOffer * (coupon.discountValue / 100));
          } else if (coupon.benefitType === "fixed-discount") {
            couponDiscountAmount = Math.min(priceAfterOffer, coupon.discountValue);
          }
        }
      }
    }

    const totalDiscount = offerDiscountAmount + couponDiscountAmount;
    const grandTotal = priceAfterOffer - couponDiscountAmount;
    const gstAmount = 0;

    // Create Subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId: session.user.id,
        itemId: itemId,
        accountType: session.user.accountType,
        couponCode: appliedCouponCode || "",
        appliedOffer: appliedOfferId || "",
        discountAmount: totalDiscount.toString(),
        extraMonths: extraMonthsVal.toString(),
        basePrice: price.toString(),
        grandTotal: grandTotal.toString(),
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: keyId,
    }, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/payments/create-subscription error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
