import { loadEnvConfig } from "@next/env";

async function seedPricing() {
  loadEnvConfig(process.cwd());
  const { default: clientPromise } = await import("../src/lib/db");
  
  const client = await clientPromise;
  const db = client.db();
  const pricingColl = db.collection("pricing");
  
  console.log("Seeding pricing collection...");
  
  const defaultPricing = [
    // Company Base Plans
    {
      id: "company-free",
      type: "base-plan",
      target: "company",
      name: "Free Tier",
      price: 0,
      monthlyTokens: 15,
      activeJobsLimit: 2,
      activeAssessmentsLimit: 2,
      features: [
        "2 Active Job Posts",
        "2 Active Assessments",
        "15 AI Tokens/month",
        "Basic Analytics"
      ],
      updatedAt: new Date()
    },
    {
      id: "company-pro",
      type: "base-plan",
      target: "company",
      name: "Pro Plan",
      price: 2900, // Rs 2900
      monthlyTokens: 250,
      activeJobsLimit: 20,
      activeAssessmentsLimit: 10,
      features: [
        "20 Active Job Posts",
        "10 Active Assessments",
        "250 AI Tokens/month",
        "Advanced Candidate Screening",
        "Priority Email Support"
      ],
      updatedAt: new Date()
    },
    {
      id: "company-pro-plus",
      type: "base-plan",
      target: "company",
      name: "Pro+ Plan",
      price: 9900, // Rs 9900
      monthlyTokens: 1000,
      activeJobsLimit: 50,
      activeAssessmentsLimit: 9999, // Unlimited
      features: [
        "50 Active Job Posts",
        "Unlimited Assessments",
        "1000 AI Tokens/month",
        "Enterprise ATS Integration",
        "Dedicated Account Manager",
        "24/7 Phone Support"
      ],
      updatedAt: new Date()
    },
    
    // Candidate Base Plans
    {
      id: "candidate-free",
      type: "base-plan",
      target: "candidate",
      name: "Free Profile",
      price: 0,
      monthlyTokens: 5,
      activeJobsLimit: 0,
      activeAssessmentsLimit: 0,
      features: [
        "5 AI Tokens/month",
        "Create Interactive Profile",
        "Apply to Public Jobs"
      ],
      updatedAt: new Date()
    },
    {
      id: "candidate-pro",
      type: "base-plan",
      target: "candidate",
      name: "Premium Profile",
      price: 199, // Rs 199
      monthlyTokens: 50,
      activeJobsLimit: 0,
      activeAssessmentsLimit: 0,
      features: [
        "50 AI Tokens/month",
        "Resume Review by AI",
        "AI Mock Interview Access",
        "Direct Messaging to Recruiters"
      ],
      updatedAt: new Date()
    },
    {
      id: "candidate-pro-plus",
      type: "base-plan",
      target: "candidate",
      name: "Elite Profile",
      price: 499, // Rs 499
      monthlyTokens: 200,
      activeJobsLimit: 0,
      activeAssessmentsLimit: 0,
      features: [
        "200 AI Tokens/month",
        "Unlimited Mock Interviews",
        "Profile Boost to Top Employers",
        "Resume Rewrite & Review Support"
      ],
      updatedAt: new Date()
    },
    
    // AI Token Packs
    {
      id: "tokens-100",
      type: "ai-token-pack",
      name: "Starter Pack",
      tokensCount: 100,
      price: 99, // Rs 99
      updatedAt: new Date()
    },
    {
      id: "tokens-500",
      type: "ai-token-pack",
      name: "Value Pack",
      tokensCount: 500,
      price: 199, // Rs 199
      updatedAt: new Date()
    },
    {
      id: "tokens-1000",
      type: "ai-token-pack",
      name: "Power Pack",
      tokensCount: 1000,
      price: 399, // Rs 399
      updatedAt: new Date()
    }
  ];
  
  for (const doc of defaultPricing) {
    await pricingColl.updateOne(
      { id: doc.id },
      { $set: doc },
      { upsert: true }
    );
    console.log(`- Seeded/updated product ID: ${doc.id}`);
  }
  
  // Create index on type and id
  await pricingColl.createIndex({ id: 1 }, { unique: true });
  await pricingColl.createIndex({ type: 1 });
  
  console.log("Pricing seeding complete!");
  process.exit(0);
}

seedPricing().catch(console.error);
