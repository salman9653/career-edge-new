import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createQuestion, getCompanyQuestions, deleteQuestion } from "@/lib/dal";
import clientPromise from "@/lib/db";
import { generateQuestions } from "@/lib/gemini";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const data = await getCompanyQuestions(session.user.id, search, skip, limit);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    console.error("GET /api/questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

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

      // Calculate token cost
      let totalCost = 0;
      const existingIds = questions
        .map(q => q.id || q._id)
        .filter(id => id && ObjectId.isValid(id))
        .map(id => new ObjectId(id));
        
      let dbQuestionsMap = new Map<string, any>();
      if (existingIds.length > 0) {
        const dbQs = await db.collection("questions").find({ _id: { $in: existingIds } }).toArray();
        dbQs.forEach(q => dbQuestionsMap.set(q._id.toString(), q));
      }
      
      for (const q of questions) {
        const idStr = (q.id || q._id)?.toString();
        if (idStr && dbQuestionsMap.has(idStr)) {
          const dbQ = dbQuestionsMap.get(idStr);
          const alreadyLinked = dbQ.companyIds && dbQ.companyIds.includes(companyId);
          if (!alreadyLinked) {
            if (dbQ.isGlobal || dbQ.createdByName === "AI Generator") {
              totalCost += 1;
            }
          }
        } else {
          if (q.createdByName === "AI Generator" || q.isAI || q.isGlobal) {
            totalCost += 3;
          }
        }
      }

      if (totalCost > 0) {
        const { deductTokens } = await import("@/lib/dal");
        const deduction = await deductTokens(companyId, totalCost, `Approved ${questions.length} questions`);
        if (!deduction.success) {
          return NextResponse.json({ error: deduction.error }, { status: 402 });
        }
      }

      const now = new Date();
      const newDocs: any[] = [];
      const existingIdsToLink: ObjectId[] = [];

      for (const q of questions) {
        if (q.id && ObjectId.isValid(q.id)) {
          existingIdsToLink.push(new ObjectId(q.id));
        } else if (q._id && ObjectId.isValid(q._id)) {
          existingIdsToLink.push(new ObjectId(q._id));
        } else {
          newDocs.push({
            companyId, // creator metadata
            companyIds: [companyId], // link this company
            isGlobal: true, // newly generated AI questions are global by default
            question: q.question,
            type: q.type || "Mcq",
            difficulty: q.difficulty || "Medium",
            categories: Array.isArray(q.categories) ? q.categories : [],
            status: q.status || "Active",
            mcqOptions: q.mcqOptions || [],
            createdByName: "AI Generator", // mark creator as AI
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // 1. Link existing questions
      if (existingIdsToLink.length > 0) {
        await db.collection("questions").updateMany(
          { _id: { $in: existingIdsToLink } },
          { $addToSet: { companyIds: companyId } }
        );
      }

      // 2. Insert new questions
      if (newDocs.length > 0) {
        await db.collection("questions").insertMany(newDocs);
      }

      return NextResponse.json({
        success: true,
        count: existingIdsToLink.length + newDocs.length,
        insertedCount: newDocs.length,
        linkedCount: existingIdsToLink.length
      });
    }

    // Check if this is a request to generate questions via AI
    if (body.generateAI) {
      const { jobTitle = "Software Engineer", keySkills = "JavaScript", difficulty = "Medium", count = 3 } = body;
      const countNum = Math.max(1, Math.min(10, count));

      // Token balance check
      const { getCompanyTokenBalance } = await import("@/lib/dal");
      const balance = await getCompanyTokenBalance(companyId);
      if (balance.total <= 0) {
        return NextResponse.json(
          { error: "Insufficient AI tokens. Please upgrade your plan or purchase top-ups." },
          { status: 402 }
        );
      }

      const skillsArray = typeof keySkills === "string"
        ? keySkills.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const client = await clientPromise;
      const db = client.db();
      const now = new Date();

      // 1. Pre-Generation DB Check: Look for existing global questions that match the criteria
      // and that the current company doesn't already have in their bank.
      let existingGlobal: any[] = [];
      if (skillsArray.length > 0) {
        try {
          existingGlobal = await db.collection("questions").find({
            $text: { $search: keySkills },
            isGlobal: true,
            difficulty,
            companyIds: { $ne: companyId } // Exclude what they already have
          })
          .limit(countNum)
          .toArray();
        } catch (err) {
          console.error("Text index search failed, falling back to regex query:", err);
          const regexTerms = skillsArray.map(term => new RegExp(term, "i"));
          existingGlobal = await db.collection("questions").find({
            isGlobal: true,
            difficulty,
            categories: { $in: regexTerms },
            companyIds: { $ne: companyId }
          })
          .limit(countNum)
          .toArray();
        }
      }

      const M = existingGlobal.length;
      const neededCount = countNum - M;

      let uniqueQuestions: any[] = [];
      const newInsertDocs: any[] = [];

      if (neededCount > 0) {
        // 2. Fetch the company's existing questions + suggested pool questions to avoid concept overlap
        const companyExisting = await db.collection("questions").find({
          $or: [
            { companyId },
            { companyIds: companyId }
          ]
        }, { projection: { question: 1 } }).toArray();

        const avoidTexts = [
          ...companyExisting.map(q => q.question),
          ...existingGlobal.map(q => q.question)
        ];

        // 3. Generate only the remaining difference from Gemini
        const generated = await generateQuestions(jobTitle, keySkills, difficulty, neededCount, avoidTexts);

        // 4. Post-Generation DB Match & Immediate Global Save
        for (const genQ of generated) {
          const normText = genQ.question.toLowerCase().trim().replace(/\s+/g, " ");
          const matchedDbQ = await db.collection("questions").findOne({
            question: { $regex: new RegExp("^" + escapeRegex(normText) + "$", "i") }
          });

          if (matchedDbQ) {
            uniqueQuestions.push({
              id: matchedDbQ._id.toString(),
              question: matchedDbQ.question,
              type: matchedDbQ.type,
              difficulty: matchedDbQ.difficulty,
              categories: matchedDbQ.categories,
              status: matchedDbQ.status,
              mcqOptions: matchedDbQ.mcqOptions
            });
          } else {
            // Brand new question: generate ID and insert immediately with empty companyIds
            const newId = new ObjectId();
            const newDoc = {
              _id: newId,
              question: genQ.question,
              type: genQ.type || "Mcq",
              difficulty: genQ.difficulty || "Medium",
              categories: Array.isArray(genQ.categories) ? genQ.categories : [],
              status: genQ.status || "Active",
              mcqOptions: genQ.mcqOptions || [],
              isGlobal: true,
              companyIds: [], // Start with empty array; user's company will be added on batchSave approval
              createdByName: "AI Generator",
              createdAt: now,
              updatedAt: now
            };
            newInsertDocs.push(newDoc);

            uniqueQuestions.push({
              id: newId.toString(),
              question: newDoc.question,
              type: newDoc.type,
              difficulty: newDoc.difficulty,
              categories: newDoc.categories,
              status: newDoc.status,
              mcqOptions: newDoc.mcqOptions
            });
          }
        }

        // Insert all newly generated questions immediately to the global bank
        if (newInsertDocs.length > 0) {
          await db.collection("questions").insertMany(newInsertDocs);
        }
      }

      // Combine both lists
      const resultQuestions = [
        ...existingGlobal.map(q => ({
          id: q._id.toString(),
          question: q.question,
          type: q.type,
          difficulty: q.difficulty,
          categories: q.categories,
          status: q.status,
          mcqOptions: q.mcqOptions
        })),
        ...uniqueQuestions
      ];

      return NextResponse.json({ success: true, questions: resultQuestions });
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

    let deletedCount = 0;
    for (const id of ids) {
      const res = await deleteQuestion(id, companyId);
      if (res.success) {
        deletedCount++;
      }
    }

    return NextResponse.json({ success: true, count: deletedCount });
  } catch (err: unknown) {
    console.error("DELETE /api/questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
