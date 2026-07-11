import { loadEnvConfig } from "@next/env";

async function cleanDb() {
  loadEnvConfig(process.cwd());
  const { default: clientPromise } = await import("../src/lib/db");
  
  const client = await clientPromise;
  const db = client.db();
  const questionsColl = db.collection("questions");
  
  console.log("Searching for test questions in DB...");
  
  // Find all questions with companyId starting with "test-company"
  const testDocs = await questionsColl.find({
    $or: [
      { companyId: /^test-company-/ },
      { companyIds: /^test-company-/ }
    ]
  }).toArray();
  
  console.log(`Found ${testDocs.length} test documents to clean up.`);
  
  if (testDocs.length > 0) {
    const result = await questionsColl.deleteMany({
      $or: [
        { companyId: /^test-company-/ },
        { companyIds: /^test-company-/ }
      ]
    });
    console.log(`Deleted ${result.deletedCount} test documents.`);
  }
  
  console.log("Cleanup complete!");
  process.exit(0);
}

cleanDb().catch(console.error);
