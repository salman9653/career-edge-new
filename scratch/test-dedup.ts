import { loadEnvConfig } from "@next/env";

async function runTests() {
  // Load environment variables from .env.local
  loadEnvConfig(process.cwd());

  const { default: clientPromise } = await import("../src/lib/db");
  const { 
    createQuestion, 
    getCompanyQuestions, 
    updateQuestion, 
    deleteQuestion 
  } = await import("../src/lib/dal");
  const { ObjectId } = await import("mongodb");

  console.log("=== STARTING QUESTION BANK DEDUPLICATION & POOLING TESTS ===\n");
  
  const client = await clientPromise;
  const db = client.db();
  const questionsColl = db.collection("questions");
  
  const companyA = "test-company-a-" + Date.now();
  const companyB = "test-company-b-" + Date.now();
  
  try {
    // ----------------------------------------------------
    // TEST 1: Creating private custom questions
    // ----------------------------------------------------
    console.log("Test 1: Creating custom question for Company A...");
    const q1Data = {
      question: "What is React reconciliation?",
      type: "Mcq",
      difficulty: "Medium",
      categories: ["React", "JavaScript"],
      status: "Active",
      mcqOptions: [
        { id: "1", text: "Process of syncing virtual DOM with real DOM", isCorrect: true },
        { id: "2", text: "A styling framework", isCorrect: false }
      ]
    };
    
    const createRes1 = await createQuestion(companyA, q1Data);
    console.log("-> Custom question created. ID:", createRes1.id);
    
    // Fetch Company A questions
    const qListA = await getCompanyQuestions(companyA);
    console.log("-> Company A questions count:", qListA.length);
    if (qListA.length !== 1) throw new Error("Expected 1 question for Company A");
    if (qListA[0].isGlobal !== false) throw new Error("Expected custom question to be private (isGlobal = false)");
    console.log("-> Test 1 Passed ✅\n");
    
    // ----------------------------------------------------
    // TEST 2: AI Batch Save and Linking
    // ----------------------------------------------------
    console.log("Test 2: Saving an AI generated question globally for Company A...");
    const globalQData = {
      question: "Which hook is used for side effects in React?",
      type: "Mcq",
      difficulty: "Easy",
      categories: ["React"],
      status: "Active",
      mcqOptions: [
        { id: "1", text: "useEffect", isCorrect: true },
        { id: "2", text: "useState", isCorrect: false }
      ]
    };
    
    // Insert directly simulating the batchSave API route
    const now = new Date();
    const batchInsertRes = await questionsColl.insertOne({
      ...globalQData,
      companyId: companyA,
      companyIds: [companyA],
      isGlobal: true,
      createdByName: "AI Generator",
      createdAt: now,
      updatedAt: now
    });
    
    const globalQId = batchInsertRes.insertedId.toString();
    console.log("-> Global question inserted for Company A. ID:", globalQId);
    
    // Now simulate Company B generating questions and reusing the global question
    console.log("Test 3: Company B reuses the global question from Company A...");
    
    // Link existing global question to Company B simulating batchSave link
    await questionsColl.updateMany(
      { _id: new ObjectId(globalQId) },
      { $addToSet: { companyIds: companyB } }
    );
    
    // Verify Company B now sees the question in their bank
    const qListB = await getCompanyQuestions(companyB);
    console.log("-> Company B questions count:", qListB.length);
    if (qListB.length !== 1 || qListB[0].id !== globalQId) {
      throw new Error("Company B should have access to reused global question");
    }
    
    // Verify that the global question doc now contains both company IDs
    const updatedGlobalDoc = await questionsColl.findOne({ _id: new ObjectId(globalQId) });
    console.log("-> Shared question companyIds array:", updatedGlobalDoc?.companyIds);
    if (updatedGlobalDoc?.companyIds.length !== 2) {
      throw new Error("Shared question should have 2 linked company IDs");
    }
    console.log("-> Test 2 & 3 Passed ✅\n");
    
    // ----------------------------------------------------
    // TEST 4: Copy-On-Write (COW) Update on Shared Question
    // ----------------------------------------------------
    console.log("Test 4: Company B edits the shared global question (COW)...");
    const updatedQData = {
      ...globalQData,
      question: "Which hook is used for side effects in React? (Edited by Company B)"
    };
    
    const updateRes = await updateQuestion(globalQId, companyB, updatedQData);
    console.log("-> Update result:", updateRes);
    
    // Verify that Company B now has a new private cloned question
    const qListBPostUpdate = await getCompanyQuestions(companyB);
    console.log("-> Company B questions count post-edit:", qListBPostUpdate.length);
    console.log("-> Company B question text:", qListBPostUpdate[0].question);
    console.log("-> Company B question isGlobal:", qListBPostUpdate[0].isGlobal);
    console.log("-> Company B question id:", qListBPostUpdate[0].id);
    
    if (qListBPostUpdate[0].id === globalQId) {
      throw new Error("COW failed: Company B's question ID should have changed");
    }
    if (qListBPostUpdate[0].isGlobal !== false) {
      throw new Error("COW failed: Cloned question should be private (isGlobal = false)");
    }
    
    // Verify Company A's question is untouched and they are now the sole owner
    const qListAPostUpdate = await getCompanyQuestions(companyA);
    const companyASharedQ = qListAPostUpdate.find((q: any) => q.id === globalQId);
    console.log("-> Company A original question text:", companyASharedQ?.question);
    
    const originalDocAfterCOW = await questionsColl.findOne({ _id: new ObjectId(globalQId) });
    console.log("-> Original question companyIds list post-COW:", originalDocAfterCOW?.companyIds);
    
    if (companyASharedQ?.question !== globalQData.question) {
      throw new Error("COW failed: Company A's question was modified");
    }
    if (originalDocAfterCOW?.companyIds.includes(companyB)) {
      throw new Error("COW failed: Company B was not removed from the original question");
    }
    console.log("-> Test 4 (Copy-On-Write) Passed ✅\n");
    
    // ----------------------------------------------------
    // TEST 5: Deleting a Shared Question (Unlinking) vs Private Question (Deleting)
    // ----------------------------------------------------
    console.log("Test 5: Verifying Delete logic...");
    
    // Scenario 5A: Global Question (should be kept in DB even if unlinked by all)
    console.log("-> 5A: Testing Global Shared Question deletion...");
    const globalShareQRes = await questionsColl.insertOne({
      question: "Global Shared Question for Delete Test",
      companyId: companyA,
      companyIds: [companyA, companyB],
      isGlobal: true,
      createdAt: now,
      updatedAt: now
    });
    const globalShareQId = globalShareQRes.insertedId.toString();
    
    await deleteQuestion(globalShareQId, companyA);
    const globalDoc1 = await questionsColl.findOne({ _id: new ObjectId(globalShareQId) });
    if (!globalDoc1 || globalDoc1.companyIds.includes(companyA)) {
      throw new Error("5A: Company A should be unlinked");
    }
    
    await deleteQuestion(globalShareQId, companyB);
    const globalDoc2 = await questionsColl.findOne({ _id: new ObjectId(globalShareQId) });
    if (!globalDoc2) {
      throw new Error("5A: Global question should remain in DB even if unlinked by all companies");
    }
    if (globalDoc2.companyIds.length !== 0) {
      throw new Error("5A: All company IDs should be unlinked");
    }
    console.log("   -> 5A Passed (Global question remains in DB) ✅");

    // Scenario 5B: Private Shared Question (should be deleted when last company unlinks)
    console.log("-> 5B: Testing Private Shared Question deletion...");
    const privateShareQRes = await questionsColl.insertOne({
      question: "Private Shared Question for Delete Test",
      companyId: companyA,
      companyIds: [companyA, companyB],
      isGlobal: false,
      createdAt: now,
      updatedAt: now
    });
    const privateShareQId = privateShareQRes.insertedId.toString();
    
    await deleteQuestion(privateShareQId, companyA);
    const privateDoc1 = await questionsColl.findOne({ _id: new ObjectId(privateShareQId) });
    if (!privateDoc1 || privateDoc1.companyIds.includes(companyA)) {
      throw new Error("5B: Company A should be unlinked");
    }
    
    await deleteQuestion(privateShareQId, companyB);
    const privateDoc2 = await questionsColl.findOne({ _id: new ObjectId(privateShareQId) });
    if (privateDoc2) {
      throw new Error("5B: Private shared question should be deleted from DB when the last company unlinks");
    }
    console.log("   -> 5B Passed (Private question deleted from DB) ✅");
    
    console.log("-> Test 5 (Deletes & Unlinking) Passed ✅\n");
    
    console.log("=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY === 🎉");
  } catch (err) {
    console.error("❌ TEST FAILED:", err);
  } finally {
    // Cleanup test data
    console.log("\nCleaning up test collections...");
    await questionsColl.deleteMany({ companyId: { $in: [companyA, companyB] } });
    await questionsColl.deleteMany({ companyIds: { $in: [companyA, companyB] } });
    process.exit(0);
  }
}

runTests();
