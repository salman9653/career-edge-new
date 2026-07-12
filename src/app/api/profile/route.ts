import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

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
    const userId = session.user.id;
    const accountType = session.user.accountType;

    if (accountType === "candidate") {
      const profile = await db.collection("candidate_profiles").findOne({ userId });
      if (profile) {
        let activePlan = profile.activePlan || "candidate-free";
        if (activePlan.toLowerCase() === "free" || activePlan.toLowerCase() === "starter") {
          activePlan = "candidate-free";
        }
        profile.activePlan = activePlan;
      }
      return NextResponse.json({ profile });
    } else if (accountType === "company") {
      const profile = await db.collection("company_profiles").findOne({ userId });
      if (profile) {
        let activePlan = profile.activePlan || "company-free";
        if (activePlan.toLowerCase() === "free" || activePlan.toLowerCase() === "starter") {
          activePlan = "company-free";
        }
        profile.activePlan = activePlan;
      }
      return NextResponse.json({ profile });
    } else if (accountType === "admin") {
      // Admin profile details reside in the user collection
      const queries: any[] = [{ id: userId }, { _id: userId }];
      if (ObjectId.isValid(userId)) {
        queries.push({ _id: new ObjectId(userId) });
      }
      const user = await db.collection("user").findOne({ $or: queries });
      return NextResponse.json({ profile: user });
    }

    return NextResponse.json({ profile: null });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const accountType = session.user.accountType;
    const now = new Date();

    const userUpdates: Record<string, any> = { updatedAt: now };
    if (body.name !== undefined) userUpdates.name = body.name;
    if (body.image !== undefined) userUpdates.image = body.image;

    if (Object.keys(userUpdates).length > 1) {
      const queries: any[] = [{ id: userId }, { _id: userId }];
      if (ObjectId.isValid(userId)) {
        queries.push({ _id: new ObjectId(userId) });
      }
      await db.collection("user").updateOne(
        { $or: queries },
        { $set: userUpdates }
      );
    }

    if (accountType === "candidate") {
      const updateData: Record<string, any> = { userId, updatedAt: now };
      const fields = [
        "jobTitle", "skills", "experience", "resumeName", "resumeBase64",
        "phone", "location", "bio", "dob", "gender", "maritalStatus",
        "address", "languages", "career", "employment", "education", "projects", "socials"
      ];
      
      fields.forEach(f => {
        if (body[f] !== undefined) updateData[f] = body[f];
      });

      const result = await db.collection("candidate_profiles").findOneAndUpdate(
        { userId },
        { $set: updateData, $setOnInsert: { createdAt: now } },
        { upsert: true, returnDocument: "after" }
      );

      return NextResponse.json({ success: true, profile: result });
    } else if (accountType === "company") {
      const updateData: Record<string, any> = { userId, updatedAt: now };
      const fields = [
        "companyName", "industry", "location", "websiteUrl", "companySize",
        "companyType", "founded", "about", "benefits", "socials", "contact"
      ];
      
      fields.forEach(f => {
        if (body[f] !== undefined) updateData[f] = body[f];
      });

      const result = await db.collection("company_profiles").findOneAndUpdate(
        { userId },
        { $set: updateData, $setOnInsert: { createdAt: now } },
        { upsert: true, returnDocument: "after" }
      );

      return NextResponse.json({ success: true, profile: result });
    } else if (accountType === "admin") {
      const updateData: any = { updatedAt: now };
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.image !== undefined) updateData.image = body.image;

      const queries: any[] = [{ id: userId }, { _id: userId }];
      if (ObjectId.isValid(userId)) {
        queries.push({ _id: new ObjectId(userId) });
      }
      const result = await db.collection("user").findOneAndUpdate(
        { $or: queries },
        { $set: updateData },
        { returnDocument: "after" }
      );
      return NextResponse.json({ success: true, profile: result });
    }

    return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/profile error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
