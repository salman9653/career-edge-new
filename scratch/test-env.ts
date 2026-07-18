import * as nextEnv from "@next/env";

async function test() {
  const loadConfig = nextEnv.loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
  if (loadConfig) {
    loadConfig(process.cwd());
  }
  console.log("=====================================");
  console.log("NEXT_PUBLIC_APP_URL:", JSON.stringify(process.env.NEXT_PUBLIC_APP_URL));
  console.log("BETTER_AUTH_URL:", JSON.stringify(process.env.BETTER_AUTH_URL));
  console.log("All env keys containing NEXT_PUBLIC:");
  for (const key of Object.keys(process.env)) {
    if (key.includes("NEXT_PUBLIC")) {
      console.log(`- "${key}": ${JSON.stringify(process.env[key])}`);
    }
  }
  console.log("=====================================");
}

test().catch(console.error);
