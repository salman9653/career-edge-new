import "server-only";
import { MongoClient, MongoClientOptions } from "mongodb";
import dns from "node:dns";

// Force Node.js to use IPv4 DNS resolution first on Windows.
// This prevents Windows from prioritizing IPv6 DNS queries which fail on most local routers.
dns.setDefaultResultOrder("ipv4first");

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  retryWrites: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClient = client;
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("\n==================================================");
      console.error("ERROR: MongoDB Connection Refused.");
      console.error("Please verify:");
      console.error("1. Your current IP is whitelisted on MongoDB Atlas (Network Access -> 0.0.0.0/0 or Current IP).");
      console.error("2. Your firewall or local network allows outbound traffic on MongoDB port 27017.");
      console.error("3. If Atlas is blocked, try using a local connection URI in .env.local: MONGODB_URI=\"mongodb://127.0.0.1:27017/career-edge\"");
      console.error("Error details:", err.message);
      console.error("==================================================\n");
      throw err;
    });
  }
  client = globalWithMongo._mongoClient!;
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error("Production MongoDB connection failed:", err.message);
    throw err;
  });
}

export default clientPromise;
export { client };
