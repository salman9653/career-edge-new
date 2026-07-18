import * as nextEnv from "@next/env";

async function test() {
  const loadConfig = nextEnv.loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
  if (loadConfig) {
    loadConfig(process.cwd());
  }
  
  const { default: Razorpay } = await import("razorpay");
  
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const planId = process.env.NEXT_PUBLIC_COMPANY_PRO_MONTHLY_PLAN_ID;
  
  console.log("=====================================");
  console.log("Using credentials:");
  console.log("RAZORPAY_KEY_ID:", keyId);
  console.log("RAZORPAY_KEY_SECRET length:", keySecret?.length);
  console.log("NEXT_PUBLIC_COMPANY_PRO_MONTHLY_PLAN_ID:", planId);
  console.log("=====================================");
  
  if (!keyId || !keySecret || !planId) {
    console.error("Missing credentials or plan ID");
    return;
  }
  
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  
  try {
    console.log("Attempting to create subscription in Razorpay...");
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,
      notes: {
        test: "yes"
      }
    });
    console.log("Success! Created subscription:", subscription.id);
  } catch (err: any) {
    console.error("Razorpay Error Details:");
    if (err.statusCode) console.error("HTTP Status Code:", err.statusCode);
    if (err.error) console.error("Error Object:", JSON.stringify(err.error));
    console.error("Full Error:", err);
  }
}

test().catch(console.error);
