import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateQuestion, deleteQuestion } from "@/lib/dal";

interface RouteParams {
  params: Promise<{
    questionId: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.accountType !== "company") {
      return NextResponse.json({ error: "Only companies can manage questions" }, { status: 403 });
    }

    const { questionId } = await params;
    const companyId = session.user.id;
    const body = await request.json();

    const { question, type, difficulty, categories, status, mcqOptions } = body;

    // Validate input
    if (!question || !type || !difficulty || !categories) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "Mcq") {
      if (!mcqOptions || !Array.isArray(mcqOptions) || mcqOptions.length < 2) {
        return NextResponse.json({ error: "MCQ questions require at least 2 options" }, { status: 400 });
      }
      const hasCorrect = mcqOptions.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        return NextResponse.json({ error: "Must specify a correct option for MCQ questions" }, { status: 400 });
      }
    }

    const categoriesArray = typeof categories === "string" 
      ? categories.split(",").map((c: string) => c.trim()).filter(Boolean)
      : categories;

    const questionData = {
      question,
      type,
      difficulty,
      categories: categoriesArray,
      status: status || "Active",
      mcqOptions: type === "Mcq" ? mcqOptions : []
    };

    const result = await updateQuestion(questionId, companyId, questionData);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to update question" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("PUT /api/questions/[questionId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.accountType !== "company") {
      return NextResponse.json({ error: "Only companies can manage questions" }, { status: 403 });
    }

    const { questionId } = await params;
    const companyId = session.user.id;

    const result = await deleteQuestion(questionId, companyId);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to delete question" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("DELETE /api/questions/[questionId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
