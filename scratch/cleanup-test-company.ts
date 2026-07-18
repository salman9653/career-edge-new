import * as nextEnv from "@next/env";

async function cleanup() {
  const loadEnv = nextEnv.loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
  if (loadEnv) {
    loadEnv(process.cwd());
  } else {
    console.warn("Could not find loadEnvConfig in @next/env module");
  }
  const { MongoClient } = await import("mongodb");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  console.log("Looking for user named 'Test Company'...");
  const user = await db.collection("user").findOne({ name: "Test Company" });
  if (!user) {
    console.error("Could not find user named 'Test Company' in 'user' collection. Printing first 10 users:");
    const list = await db.collection("user").find({}).limit(10).toArray();
    for (const u of list) {
      console.log(`- name: "${u.name}", email: "${u.email}", id: "${u.id}"`);
    }
    await client.close();
    return;
  }

  const userId = user._id.toString();
  console.log(`Found user: ${user.name} (id: ${userId}, email: ${user.email})`);

  // Delete payment logs in payments collection
  const paymentsRes = await db.collection("payments").deleteMany({ userId });
  console.log(`Deleted ${paymentsRes.deletedCount} records from 'payments' collection.`);

  // Delete transaction logs in token_transactions collection
  const transRes = await db.collection("token_transactions").deleteMany({ companyId: userId });
  console.log(`Deleted ${transRes.deletedCount} records from 'token_transactions' collection.`);

  // Reset promotions redemption counts
  console.log("Resetting all promotions redemption counters to 0...");
  await db.collection("promotions").updateMany(
    {},
    { $set: { currentTotalRedemptions: 0 } }
  );

  // Reset company profile back to Free plan and reset AI tokens to baseline
  console.log("Resetting company profile plan state to company-free and AI tokens to baseline...");
  const profileRes = await db.collection("company_profiles").updateOne(
    { userId },
    {
      $set: {
        activePlan: "company-free",
        "aiTokens.allocated": 15,
        "aiTokens.purchased": 0,
        "aiTokens.total": 15,
        updatedAt: new Date()
      },
      $unset: {
        subscription: "" // Remove active subscriptions reference
      }
    }
  );
  console.log(`Updated company profile: ${profileRes.modifiedCount} matches.`);

  console.log("Cleanup completed successfully!");
  await client.close();
}

cleanup().catch((err) => {
  console.error("Cleanup script failed:", err);
});
