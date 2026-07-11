import { loadEnvConfig } from "@next/env";

async function runTest() {
  loadEnvConfig(process.cwd());
  const { default: clientPromise } = await import("../src/lib/db");
  const { 
    checkAndRefillTokens, 
    deductTokens, 
    verifyPlanLimit 
  } = await import("../src/lib/dal");
  
  const client = await clientPromise;
  const db = client.db();
  
  const testCompanyId = "test-company-12345";
  
  console.log("=== STARTING MONETIZATION & LIMITS TEST ===");
  
  // Clean up previous runs
  await db.collection("company_profiles").deleteOne({ userId: testCompanyId });
  await db.collection("token_transactions").deleteMany({ companyId: testCompanyId });
  await db.collection("jobs").deleteMany({ companyId: testCompanyId });
  
  // 1. Seed test company profile with old refill date and depleted tokens
  console.log("\n1. Seeding test company profile...");
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 35); // 35 days ago
  
  await db.collection("company_profiles").insertOne({
    userId: testCompanyId,
    activePlan: "company-free",
    aiTokens: {
      allocated: 2,
      purchased: 5,
      total: 7,
      lastRefilledAt: pastDate
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // 2. Test lazy refill
  console.log("2. Running checkAndRefillTokens (should refill allocated back to 15)...");
  await checkAndRefillTokens(testCompanyId);
  
  let profile = await db.collection("company_profiles").findOne({ userId: testCompanyId });
  console.log("Refilled tokens balance info:", profile?.aiTokens);
  
  if (profile?.aiTokens?.allocated !== 15 || profile?.aiTokens?.total !== 20) {
    throw new Error("Refill verification failed! Expected allocated=15, total=20.");
  }
  console.log("✅ checkAndRefillTokens successful!");

  // Check transactions ledger
  const refills = await db.collection("token_transactions").find({ companyId: testCompanyId, type: "refill" }).toArray();
  console.log("Refill transactions logged:", refills.length);
  if (refills.length === 0) {
    throw new Error("Refill transaction log not created!");
  }
  console.log("✅ Refill transaction successfully logged!");

  // 3. Test token deduction (within allocated)
  console.log("\n3. Deducting 10 tokens (should subtract from allocated)...");
  let deductRes = await deductTokens(testCompanyId, 10, "Generate React Questions");
  
  profile = await db.collection("company_profiles").findOne({ userId: testCompanyId });
  console.log("After deducting 10:", profile?.aiTokens);
  if (profile?.aiTokens?.allocated !== 5 || profile?.aiTokens?.total !== 10) {
    throw new Error("Deduction from allocated failed!");
  }
  console.log("✅ Allocated deduction successful!");

  // 4. Test token deduction (crosses allocated boundary into purchased)
  console.log("\n4. Deducting 8 tokens (allocated=5, purchased=5, should deplete allocated and use 3 from purchased)...");
  deductRes = await deductTokens(testCompanyId, 8, "Generate CSS Questions");
  
  profile = await db.collection("company_profiles").findOne({ userId: testCompanyId });
  console.log("After deducting 8:", profile?.aiTokens);
  if (profile?.aiTokens?.allocated !== 0 || profile?.aiTokens?.purchased !== 2 || profile?.aiTokens?.total !== 2) {
    throw new Error("Deduction crossing into purchased failed!");
  }
  console.log("✅ Boundary deduction successful!");

  // 5. Test token deduction (insufficient balance)
  console.log("\n5. Attempting to deduct 5 tokens (current total is 2, should fail)...");
  deductRes = await deductTokens(testCompanyId, 5, "Failing deduction");
  console.log("Deduct result:", deductRes);
  if (deductRes.success) {
    throw new Error("Deduction succeeded when it should have failed!");
  }
  console.log("✅ Insufficient balance guard works!");

  // 6. Test Plan Job Posting Limits
  console.log("\n6. Testing verifyPlanLimit for Jobs (Free tier limit is 2)...");
  let limitCheck = await verifyPlanLimit(testCompanyId, "activeJobs");
  console.log("Active jobs check (0 active):", limitCheck);
  if (!limitCheck.allowed) {
    throw new Error("Limit check failed at 0 jobs!");
  }
  
  console.log("Posting 2 active jobs...");
  await db.collection("jobs").insertMany([
    { companyId: testCompanyId, title: "Job 1", status: "Active" },
    { companyId: testCompanyId, title: "Job 2", status: "Active" }
  ]);
  
  limitCheck = await verifyPlanLimit(testCompanyId, "activeJobs");
  console.log("Active jobs check (2 active):", limitCheck);
  if (limitCheck.allowed) {
    throw new Error("Limit check succeeded when it should have blocked creation at 2 active jobs!");
  }
  console.log("✅ Active jobs limit enforcement works!");

  // Cleanup test data
  console.log("\nCleaning up test collections...");
  await db.collection("company_profiles").deleteOne({ userId: testCompanyId });
  await db.collection("token_transactions").deleteMany({ companyId: testCompanyId });
  await db.collection("jobs").deleteMany({ companyId: testCompanyId });
  
  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
  process.exit(0);
}

runTest().catch(err => {
  console.error("\n❌ TEST FAILURE:", err);
  process.exit(1);
});
