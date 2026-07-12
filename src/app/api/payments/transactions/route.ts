import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCompanyTransactions } from "@/lib/dal";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const billingOnly = searchParams.get("billingOnly") === "true";
    const skip = (page - 1) * limit;

    const data = await getCompanyTransactions(session.user.id, skip, limit, billingOnly);
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("GET /api/payments/transactions error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
