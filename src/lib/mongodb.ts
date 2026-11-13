import * as dns from "node:dns";
import mongoose from "mongoose";

// Cache MongoDB connection during Next.js development
const cached = globalThis as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

if (!cached.mongoose) {
  cached.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  // Use Google DNS because the Windows default resolver is failing
  dns.setServers(["8.8.8.8"]);

  console.log("DNS servers:", dns.getServers());

  // Test MongoDB Atlas DNS resolution
  const records = await dns.promises.resolveSrv(
    "_mongodb._tcp.cluster0.6beerzi.mongodb.net"
  );

  console.log("MongoDB SRV records:", records);

  if (cached.mongoose!.conn) {
    return cached.mongoose!.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from .env.local");
  }

  if (!cached.mongoose!.promise) {
    cached.mongoose!.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    cached.mongoose!.conn = await cached.mongoose!.promise;

    console.log("MongoDB connected successfully!");

    return cached.mongoose!.conn;
  } catch (error) {
    cached.mongoose!.promise = null;

    console.error("MongoDB connection error:", error);

    throw error;
  }
}

export default connectDB;