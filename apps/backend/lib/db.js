/**
 * MongoDB persistence layer for TripMaker.
 * When MONGODB_URI is set, the backend uses this module instead of file-based storage.
 * Collections: users (id, email, passwordHash, profile, createdAt; no trips), trips (full trip doc with userId).
 */

const { MongoClient } = require("mongodb");

const DB_NAME = "tripmaker";
let client = null;
let db = null;

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required to use MongoDB.");
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("✅ MongoDB connected");
  return db;
}

function getDb() {
  if (!db) throw new Error("MongoDB not connected. Call connect() first.");
  return db;
}

async function readUsers() {
  const database = getDb();
  const usersCol = database.collection("users");
  const tripsCol = database.collection("trips");

  const users = await usersCol.find({}).toArray();
  const trips = await tripsCol.find({}).toArray();

  // Attach trips to each user (same shape as file-based: user.trips array)
  for (const user of users) {
    user.trips = (trips || []).filter((t) => t.userId === user.id);
  }

  return users;
}

async function writeUsers(users) {
  const database = getDb();
  const usersCol = database.collection("users");
  const tripsCol = database.collection("trips");

  const allTripIds = new Set();
  for (const user of users) {
    const { trips, ...userDoc } = user;
    await usersCol.replaceOne({ id: user.id }, userDoc, { upsert: true });
    for (const t of trips || []) {
      if (t && t.id) allTripIds.add(t.id);
    }
  }

  // Remove trips that are no longer in any user's list
  await tripsCol.deleteMany({ id: { $nin: Array.from(allTripIds) } });

  for (const user of users) {
    for (const t of user.trips || []) {
      if (t && t.id) {
        await tripsCol.replaceOne({ id: t.id }, t, { upsert: true });
      }
    }
  }
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connect,
  readUsers,
  writeUsers,
  close,
  getDb,
};
