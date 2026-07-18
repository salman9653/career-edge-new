import * as nextEnv from "@next/env";

async function seedPromotions() {
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
  const promotionsColl = db.collection("promotions");

  console.log("Setting up indexes for promotions collection...");
  await promotionsColl.createIndex({ code: 1 }, { unique: true, sparse: true });
  await promotionsColl.createIndex({ active: 1, startDate: 1, expiresAt: 1 });

  console.log("Seeding promotions collection...");

  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 2);

  const defaultPromotions = [
    {
      type: "offer",
      name: "Launch Promo: 50% Off",
      description: "Enjoy a special 50% auto-applied discount on Candidate Pro subscriptions!",
      benefitType: "percentage",
      discountValue: 50,
      active: true,
      startDate: new Date("2026-01-01"),
      expiresAt: oneYearFromNow,
      appliesTo: ["candidate-pro", "candidate-pro-yearly"],
      limitPerUser: 1,
      currentTotalRedemptions: 0,
      createdAt: now,
      updatedAt: now
    },
    {
      type: "coupon",
      code: "WELCOME10",
      name: "Welcome Discount",
      description: "Get 10% off your purchase. Valid on orders above ₹100.",
      benefitType: "percentage",
      discountValue: 10,
      minOrderValue: 100,
      active: true,
      startDate: new Date("2026-01-01"),
      expiresAt: oneYearFromNow,
      appliesTo: ["candidate-pro", "candidate-pro-yearly", "company-pro", "company-pro-yearly"],
      limitPerUser: 1,
      currentTotalRedemptions: 0,
      createdAt: now,
      updatedAt: now
    },
    {
      type: "coupon",
      code: "BIGSAVINGS",
      name: "Premium Corporate Discount",
      description: "Get flat ₹500 off on premium company offerings. Valid on orders above ₹2000.",
      benefitType: "fixed-discount",
      discountValue: 500,
      minOrderValue: 2000,
      active: true,
      startDate: new Date("2026-01-01"),
      expiresAt: oneYearFromNow,
      appliesTo: ["company-pro", "company-pro-yearly", "company-pro-plus", "company-pro-plus-yearly"],
      limitPerUser: 1,
      currentTotalRedemptions: 0,
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const promo of defaultPromotions) {
    const filter = promo.type === "coupon" ? { code: promo.code } : { name: promo.name };
    await promotionsColl.replaceOne(filter, promo as any, { upsert: true });
    console.log(`Upserted promotion: ${promo.name} (${promo.type})`);
  }

  console.log("Successfully completed seeding promotions!");
  await client.close();
}

seedPromotions().catch((err) => {
  console.error("Failed to seed promotions collection:", err);
  process.exit(1);
});
