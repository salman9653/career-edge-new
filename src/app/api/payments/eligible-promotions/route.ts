import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const now = new Date();

    // Query active offers within validity date ranges
    const offers = await db
      .collection("promotions")
      .find({
        type: "offer",
        active: true,
        startDate: { $lte: now },
        expiresAt: { $gte: now },
        appliesTo: itemId,
      })
      .toArray();

    const eligibleOffers = [];

    for (const offer of offers) {
      // 1. Verify global redemptions limits
      if (offer.maxTotalRedemptions !== undefined && offer.maxTotalRedemptions !== null) {
        if (offer.currentTotalRedemptions >= offer.maxTotalRedemptions) {
          continue;
        }
      }

      // 2. Verify per-user redemption limit (check transaction payments list)
      const userRedemptions = await db
        .collection("payments")
        .countDocuments({
          userId: session.user.id,
          appliedOffer: offer._id.toString(),
        });

      const userLimit = offer.limitPerUser || 1;
      if (userRedemptions >= userLimit) {
        continue;
      }

      eligibleOffers.push({
        id: offer._id.toString(),
        name: offer.name,
        description: offer.description,
        benefitType: offer.benefitType,
        discountValue: offer.discountValue,
        extraMonths: offer.extraMonths,
      });
    }

    return NextResponse.json({ data: eligibleOffers }, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/payments/eligible-promotions error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
