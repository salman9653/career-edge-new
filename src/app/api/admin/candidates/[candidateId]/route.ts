import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user || session.user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Await dynamic params (Next.js 16.2 convention)
    const { candidateId } = await params;
    if (!candidateId) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    // 3. Parse request body
    const body = await request.json();
    const { status, activePlan } = body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // 4. Validate and set status if provided
    if (status !== undefined) {
      const validStatuses = ["Active", "Inactive", "Banned"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // 5. Validate and set activePlan if provided
    if (activePlan !== undefined) {
      const validPlans = ["Free", "candidate-pro", "candidate-pro+"];
      if (!validPlans.includes(activePlan)) {
        return NextResponse.json(
          { error: `Invalid plan. Must be one of: ${validPlans.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.activePlan = activePlan;
    }

    if (Object.keys(updateData).length <= 1) {
      return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 });
    }

    // 6. Connect to DB and update candidate profile
    const client = await clientPromise;
    const db = client.db();

    // Query matches either the userId or the profile document's _id (ObjectId)
    const orQueries: Record<string, unknown>[] = [{ userId: candidateId }];
    if (ObjectId.isValid(candidateId)) {
      orQueries.push({ _id: new ObjectId(candidateId) });
    }

    const result = await db.collection("candidate_profiles").findOneAndUpdate(
      { $or: orQueries },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("PATCH /api/admin/candidates/[candidateId] error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
