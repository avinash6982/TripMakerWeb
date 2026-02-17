#!/usr/bin/env node
/**
 * Verify MongoDB connection and readUsers/read flow.
 * Loads .env from apps/backend, connects, reads users (and trips), then closes.
 * Usage: node apps/backend/scripts/verify-mongo.js (from repo root)
 */

const path = require("path");
const backendRoot = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(backendRoot, ".env") });
require("dotenv").config({ path: path.join(backendRoot, ".env.development") });

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env or .env.development");
    process.exit(1);
  }
  console.log("MONGODB_URI is set, connecting...");
  const db = require("../lib/db");
  try {
    await db.connect();
    const users = await db.readUsers();
    console.log("MongoDB is working. readUsers() returned", users.length, "user(s).");
    if (users.length > 0) {
      const tripCount = users.reduce((n, u) => n + (u.trips && u.trips.length || 0), 0);
      console.log("Total trips across users:", tripCount);
    }
  } catch (err) {
    console.error("MongoDB verification failed:", err.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
