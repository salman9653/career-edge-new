import { loadEnvConfig } from "@next/env";

async function run() {
  loadEnvConfig(process.cwd());
  const { default: PaymentSuccessPage } = await import("../src/app/dashboard/checkout/success/page");
  
  const searchParams = Promise.resolve({
    itemId: "tokens-100",
    paymentId: "pay_TCa8egwfh6W27a",
    orderId: "order_TCa8a653NOClo",
    amount: "117",
    email: "test.company@mail.com"
  });

  // Mock the auth getSession response by editing the process/environment or direct require cache
  const { auth } = await import("../src/lib/auth");
  auth.api.getSession = async () => {
    return {
      user: {
        id: "mock-user-id",
        email: "test.company@mail.com",
        name: "Test Company",
        accountType: "company"
      }
    } as any;
  };

  try {
    console.log("Running PaymentSuccessPage with mocked session...");
    const result = await PaymentSuccessPage({ searchParams });
    console.log("Success page returned HTML/JSX element successfully!");
  } catch (err) {
    console.error("Success page threw error:", err);
  }
}

run().catch(console.error);
