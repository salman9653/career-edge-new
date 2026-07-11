import { loadEnvConfig } from "@next/env";

async function debugDb() {
  loadEnvConfig(process.cwd());
  const { default: clientPromise } = await import("../src/lib/db");
  
  const client = await clientPromise;
  
  // List all databases
  const adminDb = client.db().admin();
  const dbList = await adminDb.listDatabases();
  console.log("Databases in Cluster:");
  for (const dbInfo of dbList.databases) {
    console.log(`- ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`);
  }
  
  // Check the default database from URI
  const defaultDbName = client.db().databaseName;
  console.log(`\nDefault DB Name from Client: "${defaultDbName}"`);
  
  // List collections in default DB
  const defaultDb = client.db();
  const collections = await defaultDb.listCollections().toArray();
  console.log(`Collections in "${defaultDbName}":`, collections.map(c => c.name));
  
  // Search for the document from the image: 6a51df26a56a05dcbdbd8ac1
  // across all databases
  console.log("\nSearching for _id: 6a51df26a56a05dcbdbd8ac1 across all databases...");
  const searchId = "6a51df26a56a05dcbdbd8ac1";
  
  for (const dbInfo of dbList.databases) {
    const db = client.db(dbInfo.name);
    const colls = await db.listCollections().toArray();
    if (colls.some(c => c.name === "questions")) {
      const q = await db.collection("questions").findOne({ _id: new (await import("mongodb")).ObjectId(searchId) });
      if (q) {
        console.log(`FOUND in database "${dbInfo.name}":`, JSON.stringify(q, null, 2));
      }
    }
  }
  
  process.exit(0);
}

debugDb().catch(console.error);
