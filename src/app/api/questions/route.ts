import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createQuestion } from "@/lib/dal";
import clientPromise from "@/lib/db";
import { generateQuestions } from "@/lib/gemini";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
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

    const companyId = session.user.id;
    const body = await request.json();

    // Check if this is a request to save a batch of approved questions
    if (body.batchSave) {
      const { questions } = body;
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: "No questions provided for batch save" }, { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db();
      const profile = await db.collection("company_profiles").findOne({ userId: companyId });
      const companyName = profile?.companyName || "Test Company";

      const now = new Date();
      const docs = questions.map((q: any) => ({
        companyId,
        question: q.question,
        type: q.type || "Mcq",
        difficulty: q.difficulty || "Medium",
        categories: Array.isArray(q.categories) ? q.categories : [],
        status: q.status || "Active",
        mcqOptions: q.mcqOptions || [],
        createdByName: companyName,
        createdAt: now,
        updatedAt: now,
      }));

      await db.collection("questions").insertMany(docs);
      return NextResponse.json({ success: true, count: docs.length });
    }

    // Check if this is a request to generate questions via AI
    if (body.generateAI) {
      const { jobTitle = "Software Engineer", keySkills = "JavaScript", difficulty = "Medium", count = 3 } = body;
      const countNum = Math.max(1, Math.min(10, count));

      // Generate the questions from Gemini
      const generated = await generateQuestions(jobTitle, keySkills, difficulty, countNum);

      // Perform exact-match deduplication against database
      const client = await clientPromise;
      const db = client.db();
      
      const questionTexts = generated.map(q => q.question);
      const existing = await db.collection("questions").find({
        companyId,
        question: { $in: questionTexts }
      }).toArray();

      const existingTexts = new Set(existing.map(q => q.question.toLowerCase().trim()));
      
      // Filter out duplicates
      const uniqueQuestions = generated.filter(q => !existingTexts.has(q.question.toLowerCase().trim()));

      return NextResponse.json({ success: true, questions: uniqueQuestions });
    }

    // Otherwise, create a single custom question
    const { question, type, difficulty, categories, status = "Active", mcqOptions } = body;

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
      status,
      mcqOptions: type === "Mcq" ? mcqOptions : []
    };

    const result = await createQuestion(companyId, questionData);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err: unknown) {
    console.error("POST /api/questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const companyId = session.user.id;
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No question IDs provided" }, { status: 400 });
    }

    const objectIds = ids
      .map((id: string) => {
        try {
          return new ObjectId(id);
        } catch (err) {
          return null;
        }
      })
      .filter((id): id is ObjectId => id !== null);

    if (objectIds.length === 0) {
      return NextResponse.json({ error: "Invalid question IDs" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("questions").deleteMany({
      _id: { $in: objectIds },
      companyId: companyId
    });

    return NextResponse.json({ success: true, count: result.deletedCount });
  } catch (err: unknown) {
    console.error("DELETE /api/questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
