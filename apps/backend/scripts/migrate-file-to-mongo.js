#!/usr/bin/env node
/**
 * Migrate file-based users and trips to MongoDB.
 * Reads apps/backend/data/users.json (or USER_DB_PATH) and upserts into MongoDB.
 * Requires MONGODB_URI in environment (e.g. from .env or .env.development).
 *
 * Usage (from repo root):
 *   node apps/backend/scripts/migrate-file-to-mongo.js
 * Or from apps/backend:
 *   node scripts/migrate-file-to-mongo.js
 */

const path = require("path");
const fs = require("fs").promises;

const backendRoot = path.resolve(__dirname, "..");
const envPath = path.join(backendRoot, ".env");
const envDevPath = path.join(backendRoot, ".env.development");

// Load env
require("dotenv").config({ path: envPath });
if (!process.env.MONGODB_URI) {
  require("dotenv").config({ path: envDevPath });
}

const defaultDataPath = path.join(backendRoot, "data", "users.json");
const dataPath = process.env.USER_DB_PATH
  ? path.resolve(process.env.USER_DB_PATH)
  : defaultDataPath;

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Set it in .env or .env.development in apps/backend/");
    process.exit(1);
  }

  let raw;
  try {
    raw = await fs.readFile(dataPath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("File not found:", dataPath);
      console.error("Create data/users.json or set USER_DB_PATH to your users JSON file.");
      process.exit(1);
    }
    throw err;
  }

  let users;
  try {
    const parsed = JSON.parse(raw);
    users = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Invalid JSON in", dataPath, err.message);
    process.exit(1);
  }

  if (users.length === 0) {
    console.log("No users in file. Nothing to migrate.");
    process.exit(0);
  }

  // Ensure each user has .trips array (same as server's ensureTrips)
  for (const user of users) {
    if (!Array.isArray(user.trips)) user.trips = [];
  }

  const db = require("../lib/db");
  try {
    await db.connect();
    await db.writeUsers(users);
    console.log("Migrated", users.length, "user(s) and their trips to MongoDB.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
