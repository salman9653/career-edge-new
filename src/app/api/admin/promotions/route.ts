import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";

// GET /api/admin/promotions - Fetch all promotions
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user || session.user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const promotions = await db.collection("promotions").find({}).toArray();

    // Map _id to string for simple frontend usage
    const formatted = promotions.map((p) => ({
      ...p,
      id: p._id.toString(),
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("GET /api/admin/promotions error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/admin/promotions - Create or Update a promotion
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user || session.user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      type,
      code,
      name,
      description,
      benefitType,
      discountValue,
      extraMonths,
      minOrderValue,
      limitPerUser,
      maxTotalRedemptions,
      appliesTo,
      active,
      startDate,
      expiresAt,
    } = body;

    if (!type || !name || !benefitType || !appliesTo) {
      return NextResponse.json(
        { error: "Missing required fields: type, name, benefitType, or appliesTo" },
        { status: 400 }
      );
    }

    if (type === "coupon" && !code) {
      return NextResponse.json({ error: "Coupon code is required for coupons" }, { status: 400 });
    }

    if (!Array.isArray(appliesTo)) {
      return NextResponse.json({ error: "appliesTo must be an array of plan IDs" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Setup update dataset
    const promoData: Record<string, any> = {
      type,
      name,
      description: description || "",
      benefitType,
      appliesTo: appliesTo.map(String),
      active: active === undefined ? true : Boolean(active),
      startDate: startDate ? new Date(startDate) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 31536000000), // Default 1 yr
      limitPerUser: limitPerUser !== undefined ? Number(limitPerUser) : 1,
      updatedAt: new Date(),
    };

    if (type === "coupon") {
      promoData.code = code.trim().toUpperCase();
      promoData.minOrderValue = minOrderValue !== undefined ? Number(minOrderValue) : 0;
    }

    if (benefitType === "percentage" || benefitType === "fixed-discount") {
      promoData.discountValue = discountValue !== undefined ? Number(discountValue) : 0;
    } else if (benefitType === "extra-time") {
      promoData.extraMonths = extraMonths !== undefined ? Number(extraMonths) : 0;
    }

    let result;
    if (id) {
      // Update existing
      await db.collection("promotions").updateOne(
        { _id: new ObjectId(id) },
        { $set: promoData }
      );
      result = await db.collection("promotions").findOne({ _id: new ObjectId(id) });
    } else {
      // Create new
      // Check for code uniqueness for coupons
      if (type === "coupon") {
        const existing = await db.collection("promotions").findOne({
          type: "coupon",
          code: promoData.code,
        });
        if (existing) {
          return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }
      }

      promoData.currentTotalRedemptions = 0;
      promoData.createdAt = new Date();

      const inserted = await db.collection("promotions").insertOne(promoData);
      result = await db.collection("promotions").findOne({ _id: inserted.insertedId });
    }

    const formatted = {
      ...result,
      id: result?._id.toString(),
    };

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/admin/promotions error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/admin/promotions - Delete a promotion
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user || session.user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing promotion id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const deleteRes = await db.collection("promotions").deleteOne({ _id: new ObjectId(id) });

    if (deleteRes.deletedCount === 0) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("DELETE /api/admin/promotions error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
