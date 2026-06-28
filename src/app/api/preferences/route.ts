import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

async function getUserPreferences(db: any, userId: string) {
  const queries: any[] = [{ id: userId }, { _id: userId }];
  if (ObjectId.isValid(userId)) {
    queries.push({ _id: new ObjectId(userId) });
  }
  const user = await db.collection("user").findOne({ $or: queries });
  return user?.preferences || null;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const preferences = await getUserPreferences(db, session.user.id);

    return NextResponse.json({ preferences });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("GET /api/preferences error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    // Validate body properties
    const preferencesUpdates: Record<string, any> = {};
    const allowedKeys = ["themeMode", "themeColor", "themeColorHex", "themeGradientFrom", "themeGradientTo", "font"];

    allowedKeys.forEach((key) => {
      if (body[key] !== undefined) {
        preferencesUpdates[key] = body[key];
      }
    });

    if (Object.keys(preferencesUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const queries: any[] = [{ id: userId }, { _id: userId }];
    if (ObjectId.isValid(userId)) {
      queries.push({ _id: new ObjectId(userId) });
    }

    // Load current preferences to merge updates
    const userDoc = await db.collection("user").findOne({ $or: queries });
    const currentPrefs = userDoc?.preferences || {};

    const mergedPrefs = {
      ...currentPrefs,
      ...preferencesUpdates,
    };

    await db.collection("user").updateOne(
      { $or: queries },
      { $set: { preferences: mergedPrefs } }
    );

    return NextResponse.json({ success: true, preferences: mergedPrefs });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("PATCH /api/preferences error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
