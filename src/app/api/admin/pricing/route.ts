import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";

// GET /api/admin/pricing - Fetch all pricing documents (base plans & token packs)
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
    const pricing = await db.collection("pricing").find({}).toArray();

    return NextResponse.json({ data: pricing }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("GET /api/admin/pricing error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/admin/pricing - Edit pricing offerings (price, limit, tokens count, etc.)
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user || session.user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, type, name, price, monthlyTokens, activeJobsLimit, activeAssessmentsLimit, features, tokensCount } = body;

    const finalId = id || (type === "ai-token-pack" ? `tokens-${tokensCount}-${Date.now()}` : null);
    if (!finalId) {
      return NextResponse.json({ error: "Pricing document id is required for base plans" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updateData: Record<string, any> = {
      id: finalId,
      type,
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;

    if (type === "base-plan") {
      if (price !== undefined) updateData.price = Number(price);
      if (monthlyTokens !== undefined) updateData.monthlyTokens = Number(monthlyTokens);
      if (activeJobsLimit !== undefined) updateData.activeJobsLimit = Number(activeJobsLimit);
      if (activeAssessmentsLimit !== undefined) updateData.activeAssessmentsLimit = Number(activeAssessmentsLimit);
      if (features !== undefined) {
        if (!Array.isArray(features)) {
          return NextResponse.json({ error: "Features must be an array of strings" }, { status: 400 });
        }
        updateData.features = features.map(f => String(f).trim()).filter(Boolean);
      }
    } else if (type === "ai-token-pack") {
      if (price !== undefined) updateData.price = Number(price);
      if (tokensCount !== undefined) updateData.tokensCount = Number(tokensCount);
    } else {
      return NextResponse.json({ error: "Invalid pricing document type" }, { status: 400 });
    }

    await db.collection("pricing").updateOne(
      { id: finalId },
      { $set: updateData },
      { upsert: true }
    );

    const result = await db.collection("pricing").findOne({ id: finalId });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/admin/pricing error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
