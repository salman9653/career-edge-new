import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createQuestion } from "@/lib/dal";
import clientPromise from "@/lib/db";

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

    // Check if this is a request to generate questions via AI (Mock)
    if (body.generateAI) {
      const { jobTitle = "Software Engineer", keySkills = "JavaScript", difficulty = "Medium", count = 3 } = body;
      const skillsArray = keySkills.split(",").map((s: string) => s.trim()).filter(Boolean);
      const primarySkill = skillsArray[0] || "JavaScript";
      const secondarySkill = skillsArray[1] || "React";

      // Mock questions templates
      const templates = [
        {
          question: `In a production ${jobTitle} codebase, which of the following practices best optimizes the performance of a module heavily relying on ${primarySkill}?`,
          type: "Mcq",
          difficulty: difficulty,
          categories: [primarySkill, "Performance"],
          status: "Active",
          mcqOptions: [
            { id: "1", text: "Implementing lazy-loading and code-splitting for sub-routes.", isCorrect: true },
            { id: "2", text: "Moving all computational logic to synchronous block operations.", isCorrect: false },
            { id: "3", text: "Avoiding modular files and packing all logic inside a single bundle.", isCorrect: false },
            { id: "4", text: "Disabling browser cache headers for all dynamic chunks.", isCorrect: false }
          ]
        },
        {
          question: `When designing type definitions or schemas in a ${primarySkill} application, what is the primary benefit of using strict configuration rules?`,
          type: "Mcq",
          difficulty: difficulty,
          categories: [primarySkill, "Architecture"],
          status: "Active",
          mcqOptions: [
            { id: "1", text: "Catching potential type mismatches and undefined references during compile-time rather than runtime.", isCorrect: true },
            { id: "2", text: "Completely eliminating the need for integration testing.", isCorrect: false },
            { id: "3", text: "Making the final Javascript bundle run faster in browser V8 engines.", isCorrect: false },
            { id: "4", text: "Allowing automatic code deployment without developer reviews.", isCorrect: false }
          ]
        },
        {
          question: `Which of the following describes a common state management bottleneck in a scale application utilizing ${secondarySkill}?`,
          type: "Mcq",
          difficulty: difficulty,
          categories: [secondarySkill, "State Management"],
          status: "Active",
          mcqOptions: [
            { id: "1", text: "Unnecessary component re-renders caused by lack of selector-based state subscriptions.", isCorrect: true },
            { id: "2", text: "Exceeding the browser localStorage capacity with state slices.", isCorrect: false },
            { id: "3", text: "Using standard React context instead of heavy external libraries.", isCorrect: false },
            { id: "4", text: "Exposing the store actions to the local DOM tree.", isCorrect: false }
          ]
        },
        {
          question: `A senior engineer is reviewing a pull request for a ${jobTitle} role. They note that the asynchronous handlers for ${primarySkill} could block the main event thread. How would you refactor this?`,
          type: "Mcq",
          difficulty: difficulty,
          categories: [primarySkill, "Asynchronous"],
          status: "Active",
          mcqOptions: [
            { id: "1", text: "Refactoring callbacks to asynchronous non-blocking async/await functions or utilising Web Workers.", isCorrect: true },
            { id: "2", text: "Using while loops to force sleep intervals.", isCorrect: false },
            { id: "3", text: "Converting all operations to execute on the main thread sequentially.", isCorrect: false },
            { id: "4", text: "Relying on standard CSS animations to defer background operations.", isCorrect: false }
          ]
        }
      ];

      // Slice the templates based on count requested
      const questionsToInsert = templates.slice(0, Math.min(count, templates.length));
      
      const client = await clientPromise;
      const db = client.db();
      const profile = await db.collection("company_profiles").findOne({ userId: companyId });
      const companyName = profile?.companyName || "Test Company";

      const now = new Date();
      const docs = questionsToInsert.map(q => ({
        ...q,
        companyId,
        createdByName: companyName,
        createdAt: now,
        updatedAt: now
      }));

      await db.collection("questions").insertMany(docs);
      
      return NextResponse.json({ success: true, count: docs.length });
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
