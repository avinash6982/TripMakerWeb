// Load env: .env if present; then .env.development when NODE_ENV=development or when .env is missing (Render-only; no .env required)
const path = require("path");
const envPath = path.resolve(__dirname, ".env");
const envDevPath = path.resolve(__dirname, ".env.development");
require("dotenv").config({ path: envPath });
const hasEnv = require("fs").existsSync(envPath);
if (process.env.NODE_ENV === "development" || !hasEnv) {
  require("dotenv").config({ path: envDevPath });
}
const express = require("express");
const fs = require("fs/promises");
const os = require("os");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { body, param, validationResult } = require("express-validator");
const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { getTripAgentAdapters } = require("./lib/tripAgent");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_USER_DB_PATH = path.resolve("data/users.json");
const TMP_USER_DB_PATH = path.join(os.tmpdir(), "tripmaker-users.json");
let usersFilePath = path.resolve(
  process.env.USER_DB_PATH ||
    (process.env.RENDER ? TMP_USER_DB_PATH : DEFAULT_USER_DB_PATH)
);

// JWT secret: required in production; fixed dev default so tokens survive server restarts
const DEV_JWT_SECRET = "tripmaker-dev-secret-do-not-use-in-production";
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === "production" || process.env.RENDER) {
    const error = "❌ CRITICAL: JWT_SECRET is required in production!";
    console.error(error);
    throw new Error(error);
  }
  console.log("⚠️  Development: Using fixed JWT secret (tokens valid across restarts)");
  return DEV_JWT_SECRET;
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const rawCorsOrigins =
  process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "*";
const allowedOrigins = rawCorsOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEYLEN = 64;
const DEFAULT_PROFILE = {
  phone: "",
  country: "",
  language: "en",
  currencyType: "USD",
  interests: [],
  preferredDestinations: [],
  storageUsed: 0,
};

let writeQueue = Promise.resolve();

// When MONGODB_URI is set, these are assigned in start() to lib/db; otherwise file-based.
let readUsers;
let writeUsers;

// ============================================================================
// SWAGGER CONFIGURATION
// ============================================================================

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TripMaker Authentication API",
      version: "2.0.0",
      description: `
# TripMaker Web Backend API

A comprehensive authentication and profile management API for the TripMaker travel planning application.

## Features
- User registration and authentication
- JWT token-based security
- User profile management
- Multi-language and currency support
- Rate limiting and security headers
- File-based or database storage

## Authentication
Most endpoints require a JWT token obtained from the login endpoint. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Base URL
- **Production:** https://trip-maker-web-be.vercel.app
- **Development:** http://localhost:3000

## Rate Limiting
- Registration: 5 requests per 15 minutes per IP
- Login: 10 requests per 15 minutes per IP
- Other endpoints: 100 requests per 15 minutes per IP
      `,
      contact: {
        name: "API Support",
        url: "https://github.com/avinash6982/TripMakerWeb-BE",
      },
      license: {
        name: "ISC",
        url: "https://opensource.org/licenses/ISC",
      },
    },
    servers: [
      {
        url: "https://trip-maker-web-be.vercel.app",
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["id", "email"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique user identifier",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
          },
        },
        Profile: {
          type: "object",
          required: ["id", "email", "language", "currencyType"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "User ID",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "user@example.com",
            },
            phone: {
              type: "string",
              description: "Phone number",
              example: "+1 555 000 0000",
            },
            country: {
              type: "string",
              description: "Country name",
              example: "United States",
            },
            language: {
              type: "string",
              enum: ["en", "hi", "ml", "ar", "es", "de"],
              description: "Preferred language code",
              example: "en",
            },
            currencyType: {
              type: "string",
              enum: ["USD", "EUR", "INR", "AED", "GBP", "CAD", "AUD"],
              description: "Preferred currency",
              example: "USD",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              example: "2026-01-20T12:34:56.000Z",
            },
          },
        },
        AuthResponse: {
          type: "object",
          required: ["id", "email", "token"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
            },
            token: {
              type: "string",
              description: "JWT authentication token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            message: {
              type: "string",
              description: "Success message",
              example: "Login successful.",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
              example: "Email and password are required.",
            },
          },
        },
        TripPlanItem: {
          type: "object",
          properties: {
            name: { type: "string", example: "Eiffel Tower" },
            category: { type: "string", example: "landmark" },
            durationHours: { type: "number", example: 1.5 },
          },
        },
        TripPlanSlot: {
          type: "object",
          properties: {
            timeOfDay: { type: "string", example: "morning" },
            totalHours: { type: "number", example: 2.5 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/TripPlanItem" },
            },
          },
        },
        TripPlanDay: {
          type: "object",
          properties: {
            day: { type: "integer", example: 1 },
            area: { type: "string", example: "Montmartre" },
            totalHours: { type: "number", example: 5.5 },
            slots: {
              type: "array",
              items: { $ref: "#/components/schemas/TripPlanSlot" },
            },
          },
        },
        TripPlanMeta: {
          type: "object",
          properties: {
            totalStops: { type: "number", example: 12 },
            avgStopsPerDay: { type: "number", example: 4 },
            avgHoursPerDay: { type: "number", example: 5.5 },
            maxHoursPerDay: { type: "number", example: 6 },
            maxStopsPerDay: { type: "number", example: 4 },
          },
        },
        TripPlan: {
          type: "object",
          properties: {
            destination: { type: "string", example: "Paris" },
            pace: { type: "string", example: "balanced" },
            days: { type: "integer", example: 3 },
            generatedAt: { type: "string", format: "date-time" },
            isFallback: { type: "boolean", example: false },
            meta: { $ref: "#/components/schemas/TripPlanMeta" },
            itinerary: {
              type: "array",
              items: { $ref: "#/components/schemas/TripPlanDay" },
            },
          },
        },
        Trip: {
          type: "object",
          required: [
            "id",
            "userId",
            "name",
            "destination",
            "days",
            "pace",
            "status",
            "itinerary",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Paris Family Vacation" },
            destination: { type: "string", example: "Paris" },
            days: { type: "integer", example: 3 },
            pace: { type: "string", example: "balanced" },
            status: {
              type: "string",
              enum: ["upcoming", "active", "completed", "archived"],
            },
            itinerary: {
              type: "array",
              items: { $ref: "#/components/schemas/TripPlanDay" },
            },
            transportMode: {
              type: "string",
              enum: ["flight", "train", "bus"],
              description: "MVP2: How user gets there (optional)",
            },
            isPublic: {
              type: "boolean",
              description: "MVP2: Shown in public feed (optional)",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "ok",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
            uptime: {
              type: "number",
              description: "Server uptime in seconds",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Health",
        description: "Server health check endpoints",
      },
      {
        name: "Authentication",
        description: "User registration and login endpoints",
      },
      {
        name: "Profile",
        description: "User profile management endpoints",
      },
      {
        name: "Trips",
        description: "Trip planning endpoints",
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers with CSP configured for Swagger UI
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for Swagger UI inline scripts
          "https://unpkg.com", // Allow Swagger UI from CDN
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for Swagger UI inline styles
          "https://unpkg.com", // Allow Swagger UI CSS from CDN
        ],
        imgSrc: ["'self'", "data:", "https:"], // Allow images from CDN
        connectSrc: ["'self'", "https://unpkg.com"], // API calls + source maps from CDN
      },
    },
  })
);

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: "10kb" }));

// Rate limiting
const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Relax limits in development to avoid 429 during local dev (retries, multiple tabs)
const isDev = process.env.NODE_ENV !== "production" && !process.env.RENDER;
const registerLimiter = createLimiter(
  15 * 60 * 1000,
  isDev ? 50 : 5,
  "Too many registration attempts, please try again later."
);

const loginLimiter = createLimiter(
  15 * 60 * 1000,
  isDev ? 100 : 10,
  "Too many login attempts, please try again later."
);

// Higher limit in development to avoid 429 during local dev (refreshes, HMR, multiple tabs)
const generalLimiterMax = process.env.NODE_ENV === "production" ? 100 : 500;
const generalLimiter = createLimiter(
  15 * 60 * 1000,
  generalLimiterMax,
  "Too many requests, please try again later."
);

// Stricter limit for trip agent (Gemini has RPM limits; avoid bursting)
const tripAgentLimiter = createLimiter(
  60 * 1000,
  isDev ? 15 : 10,
  "Too many AI requests. Please wait a minute and try again."
);

app.use(generalLimiter);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getUsersFilePath() {
  return usersFilePath;
}

function isReadonlyError(error) {
  return error && (error.code === "EROFS" || error.code === "EPERM");
}

async function ensureUsersFile() {
  const currentPath = getUsersFilePath();
  const dir = path.dirname(currentPath);
  try {
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(currentPath);
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        throw error;
      }
      await fs.writeFile(currentPath, "[]");
    }
  } catch (error) {
    if (isReadonlyError(error) && currentPath !== TMP_USER_DB_PATH) {
      usersFilePath = TMP_USER_DB_PATH;
      return ensureUsersFile();
    }
    throw error;
  }
}

// Development test user for consistent testing
const DEV_USER = {
  id: 'dev-user-00000000-0000-0000-0000-000000000001',
  email: 'dev@tripmaker.com',
  password: 'DevUser123!',
  trips: [],
  profile: {
    phone: '+1 555 123 4567',
    country: 'United States',
    language: 'en',
    currencyType: 'USD'
  }
};

async function seedDevUser() {
  if (!readUsers || !writeUsers) return;
  try {
    const users = await readUsers();
    if (users.find((u) => u.id === DEV_USER.id)) return;

    const devUser = {
      id: DEV_USER.id,
      email: DEV_USER.email,
      passwordHash: hashPassword(DEV_USER.password),
      trips: [],
      profile: { ...DEV_USER.profile },
      createdAt: new Date().toISOString(),
      isTestUser: true,
    };
    users.push(devUser);
    await writeUsers(users);
    console.log("✅ Development test user seeded:", DEV_USER.email);
  } catch (error) {
    console.error("Failed to seed dev user:", error);
  }
}

async function readUsersFile() {
  await writeQueue;
  await ensureUsersFile();
  const raw = await fs.readFile(getUsersFilePath(), "utf8");
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    const users = Array.isArray(parsed) ? parsed : [];
    users.forEach((user) => ensureTrips(user));
    return users;
  } catch (error) {
    error.message = `Invalid users data file: ${error.message}`;
    throw error;
  }
}

async function writeUsersFile(users) {
  await ensureUsersFile();
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.writeFile(getUsersFilePath(), JSON.stringify(users, null, 2));
    } catch (error) {
      if (isReadonlyError(error) && getUsersFilePath() !== TMP_USER_DB_PATH) {
        usersFilePath = TMP_USER_DB_PATH;
        await ensureUsersFile();
        await fs.writeFile(
          getUsersFilePath(),
          JSON.stringify(users, null, 2)
        );
      } else {
        throw error;
      }
    }
  });
  return writeQueue;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(PASSWORD_SALT_BYTES).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEYLEN);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) {
    return false;
  }
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }
  const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEYLEN);
  const storedBuffer = Buffer.from(hash, "hex");
  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }
  return crypto.timingSafeEqual(storedBuffer, derivedKey);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function ensureProfile(user) {
  const currentProfile = user.profile || {};
  user.profile = {
    ...DEFAULT_PROFILE,
    ...currentProfile,
  };
  if (typeof user.profile.storageUsed !== "number") user.profile.storageUsed = 0;
  return user.profile;
}

const TRANSPORT_MODES = ["flight", "train", "bus"];

/**
 * @typedef {Object} Trip
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string} destination
 * @property {number} days
 * @property {"relaxed"|"balanced"|"fast"} pace
 * @property {Array<Object>} itinerary
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {"upcoming"|"active"|"completed"|"archived"} status
 * @property {"flight"|"train"|"bus"} [transportMode] - MVP2: how user gets there
 * @property {boolean} [isPublic] - MVP2: shown in public feed
 * @property {Array<{code:string,role:string,expiresAt:string}>} [invites] - MVP2: pending invite codes
 * @property {Array<{userId:string,email:string,role:string}>} [collaborators] - MVP2: users with access
 */
function ensureInvites(trip) {
  if (!Array.isArray(trip.invites)) trip.invites = [];
  return trip.invites;
}
function ensureCollaborators(trip) {
  if (!Array.isArray(trip.collaborators)) trip.collaborators = [];
  return trip.collaborators;
}
function ensureLikes(trip) {
  if (!Array.isArray(trip.likes)) trip.likes = [];
  return trip.likes;
}
function ensureComments(trip) {
  if (!Array.isArray(trip.comments)) trip.comments = [];
  return trip.comments;
}
function ensureMessages(trip) {
  if (!Array.isArray(trip.messages)) trip.messages = [];
  return trip.messages;
}
function ensureGallery(trip) {
  if (!Array.isArray(trip.gallery)) trip.gallery = [];
  return trip.gallery;
}
function ensurePrerequisites(trip) {
  if (!Array.isArray(trip.prerequisites)) trip.prerequisites = [];
  return trip.prerequisites;
}
function ensureGalleryImageLikes(item) {
  if (!Array.isArray(item.likes)) item.likes = [];
  return item.likes;
}
function ensureGalleryImageComments(item) {
  if (!Array.isArray(item.comments)) item.comments = [];
  return item.comments;
}
function ensureTrips(user) {
  if (!Array.isArray(user.trips)) {
    user.trips = [];
  }
  return user.trips;
}

function ensureProfileArray(val) {
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string" && v.trim());
  if (typeof val === "string" && val.trim()) return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function buildProfileResponse(user) {
  const profile = ensureProfile(user);
  const storageUsed = typeof profile.storageUsed === "number" ? profile.storageUsed : 0;
  const limitBytes = 100 * 1024 * 1024; // 100 MB (MVP3.6)
  return {
    id: user.id,
    email: user.email,
    phone: profile.phone,
    country: profile.country,
    language: profile.language,
    currencyType: profile.currencyType,
    interests: ensureProfileArray(profile.interests),
    preferredDestinations: ensureProfileArray(profile.preferredDestinations),
    storageUsed,
    limitBytes,
    createdAt: user.createdAt,
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ============================================================================
// R2 / Upload (MVP3.6 – media in chat)
// ============================================================================

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "tripmaker-media";
const STORAGE_LIMIT_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file

function getR2Client() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

async function getPresignedPutUrl(key, contentType) {
  const client = getR2Client();
  if (!client) return null;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  return { uploadUrl, key };
}

async function getPresignedGetUrl(key) {
  const client = getR2Client();
  if (!client) return null;
  const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

async function getObjectSizeR2(key) {
  const client = getR2Client();
  if (!client) return null;
  try {
    const command = new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
    const response = await client.send(command);
    return response.ContentLength != null ? Number(response.ContentLength) : null;
  } catch {
    return null;
  }
}

function isR2Configured() {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

// ============================================================================
// TRIP PLANNER (MVP - rules + static data)
// ============================================================================

const TRIP_PACES = {
  relaxed: { maxStopsPerDay: 3, maxHours: 4.5 },
  balanced: { maxStopsPerDay: 4, maxHours: 6 },
  fast: { maxStopsPerDay: 5, maxHours: 8 },
};

const PACE_ALIASES = {
  relaxed: "relaxed",
  slow: "relaxed",
  easy: "relaxed",
  balanced: "balanced",
  medium: "balanced",
  steady: "balanced",
  fast: "fast",
  "fast-paced": "fast",
  active: "fast",
};

const TIME_SLOTS = ["morning", "afternoon", "evening"];
const SLOT_COUNTS = {
  relaxed: [1, 1, 1],
  balanced: [1, 2, 1],
  fast: [2, 2, 1],
};
const SLOT_CATEGORIES = {
  morning: ["landmark", "viewpoint", "park"],
  afternoon: ["museum", "neighborhood", "market", "experience"],
  evening: ["food", "nightlife", "relax"],
};

const CITY_LIBRARY = [
  {
    key: "paris",
    name: "Paris",
    country: "France",
    places: [
      { name: "Eiffel Tower", category: "landmark", area: "7th Arrondissement", avgTime: 2 },
      { name: "Louvre Museum", category: "museum", area: "1st Arrondissement", avgTime: 2.5 },
      { name: "Tuileries Garden", category: "park", area: "1st Arrondissement", avgTime: 1 },
      { name: "Seine River Cruise", category: "experience", area: "River", avgTime: 1.5 },
      { name: "Notre-Dame Cathedral", category: "landmark", area: "Ile de la Cite", avgTime: 1 },
      { name: "Sainte-Chapelle", category: "museum", area: "Ile de la Cite", avgTime: 1 },
      { name: "Le Marais Food Stroll", category: "food", area: "Le Marais", avgTime: 1.5 },
      { name: "Place des Vosges", category: "park", area: "Le Marais", avgTime: 1 },
      { name: "Montmartre Walk", category: "neighborhood", area: "Montmartre", avgTime: 2 },
      { name: "Sacre-Coeur Basilica", category: "viewpoint", area: "Montmartre", avgTime: 1.5 },
      { name: "Musee d'Orsay", category: "museum", area: "Left Bank", avgTime: 2 },
      { name: "Luxembourg Gardens", category: "park", area: "Left Bank", avgTime: 1.5 },
      { name: "Champs-Elysees Stroll", category: "neighborhood", area: "Champs-Elysees", avgTime: 1.5 },
      { name: "Arc de Triomphe", category: "landmark", area: "Champs-Elysees", avgTime: 1 },
      { name: "Canal Saint-Martin", category: "relax", area: "Canal", avgTime: 1.5 },
      { name: "Opera Garnier", category: "landmark", area: "Opera", avgTime: 1 },
      { name: "Saint-Germain Cafe", category: "food", area: "Left Bank", avgTime: 1 },
      { name: "Latin Quarter Bookshops", category: "neighborhood", area: "Latin Quarter", avgTime: 1.5 },
    ],
  },
  {
    key: "tokyo",
    name: "Tokyo",
    country: "Japan",
    places: [
      { name: "Shibuya Crossing", category: "landmark", area: "Shibuya", avgTime: 1 },
      { name: "Meiji Shrine", category: "landmark", area: "Harajuku", avgTime: 1.5 },
      { name: "Takeshita Street", category: "neighborhood", area: "Harajuku", avgTime: 1 },
      { name: "Asakusa Senso-ji", category: "landmark", area: "Asakusa", avgTime: 1.5 },
      { name: "Nakamise Market", category: "market", area: "Asakusa", avgTime: 1 },
      { name: "Ueno Park", category: "park", area: "Ueno", avgTime: 1.5 },
      { name: "Tokyo National Museum", category: "museum", area: "Ueno", avgTime: 2 },
      { name: "Tsukiji Outer Market", category: "market", area: "Tsukiji", avgTime: 1.5 },
      { name: "Ginza Stroll", category: "neighborhood", area: "Ginza", avgTime: 1.5 },
      { name: "TeamLab Planets", category: "experience", area: "Toyosu", avgTime: 2 },
      { name: "Odaiba Waterfront", category: "viewpoint", area: "Odaiba", avgTime: 1.5 },
      { name: "Akihabara Arcade", category: "neighborhood", area: "Akihabara", avgTime: 1.5 },
      { name: "Imperial Palace East Gardens", category: "park", area: "Chiyoda", avgTime: 1.5 },
      { name: "Roppongi Hills View", category: "viewpoint", area: "Roppongi", avgTime: 1.5 },
      { name: "Izakaya Alley Dinner", category: "food", area: "Shinjuku", avgTime: 1.5 },
      { name: "Shinjuku Gyoen", category: "park", area: "Shinjuku", avgTime: 1.5 },
      { name: "Golden Gai", category: "nightlife", area: "Shinjuku", avgTime: 1 },
      { name: "Yanaka Ginza", category: "neighborhood", area: "Yanaka", avgTime: 1.5 },
    ],
  },
  {
    key: "new-york",
    name: "New York City",
    country: "United States",
    places: [
      { name: "Central Park", category: "park", area: "Midtown", avgTime: 2 },
      { name: "Metropolitan Museum of Art", category: "museum", area: "Upper East Side", avgTime: 2 },
      { name: "Times Square", category: "landmark", area: "Midtown", avgTime: 1 },
      { name: "Broadway District", category: "nightlife", area: "Midtown", avgTime: 1.5 },
      { name: "High Line", category: "experience", area: "Chelsea", avgTime: 1.5 },
      { name: "Chelsea Market", category: "market", area: "Chelsea", avgTime: 1.5 },
      { name: "Greenwich Village Stroll", category: "neighborhood", area: "Greenwich Village", avgTime: 1.5 },
      { name: "Brooklyn Bridge Walk", category: "experience", area: "Downtown", avgTime: 1.5 },
      { name: "DUMBO Waterfront", category: "viewpoint", area: "Brooklyn", avgTime: 1.5 },
      { name: "Statue of Liberty Ferry", category: "landmark", area: "Harbor", avgTime: 2 },
      { name: "9/11 Memorial", category: "museum", area: "Downtown", avgTime: 1.5 },
      { name: "SoHo Boutiques", category: "neighborhood", area: "SoHo", avgTime: 1.5 },
      { name: "Museum of Modern Art", category: "museum", area: "Midtown", avgTime: 2 },
      { name: "Grand Central Terminal", category: "landmark", area: "Midtown", avgTime: 1 },
      { name: "Williamsburg Food Hall", category: "food", area: "Brooklyn", avgTime: 1.5 },
      { name: "Prospect Park", category: "park", area: "Brooklyn", avgTime: 1.5 },
      { name: "Top of the Rock", category: "viewpoint", area: "Midtown", avgTime: 1.5 },
      { name: "Little Italy Dinner", category: "food", area: "Little Italy", avgTime: 1.5 },
    ],
  },
  {
    key: "yerevan",
    name: "Yerevan",
    country: "Armenia",
    places: [
      { name: "Cascade Complex", category: "landmark", area: "Kentron", avgTime: 1.5 },
      { name: "Republic Square", category: "landmark", area: "Kentron", avgTime: 1 },
      { name: "Matenadaran Museum", category: "museum", area: "Kentron", avgTime: 2 },
      { name: "Vernissage Market", category: "market", area: "Kentron", avgTime: 1.5 },
      { name: "Tsitsernakaberd Memorial", category: "museum", area: "Tsitsernakaberd", avgTime: 1.5 },
      { name: "Cafesjian Center for the Arts", category: "museum", area: "Cascade", avgTime: 1.5 },
      { name: "Opera House Area", category: "landmark", area: "Kentron", avgTime: 1 },
      { name: "Northern Avenue Stroll", category: "neighborhood", area: "Kentron", avgTime: 1 },
      { name: "Garni Temple", category: "landmark", area: "Kotayk", avgTime: 2 },
      { name: "Geghard Monastery", category: "landmark", area: "Kotayk", avgTime: 1.5 },
      { name: "Echmiadzin Cathedral", category: "landmark", area: "Vagharshapat", avgTime: 2 },
      { name: "Lake Sevan Shore", category: "viewpoint", area: "Gegharkunik", avgTime: 2 },
      { name: "Armenian Brandy Factory Tour", category: "experience", area: "Yerevan", avgTime: 1.5 },
      { name: "Armenian Tavern Dinner", category: "food", area: "Kentron", avgTime: 1.5 },
      { name: "Saryan Street Cafes", category: "food", area: "Kentron", avgTime: 1 },
      { name: "History Museum of Armenia", category: "museum", area: "Kentron", avgTime: 1.5 },
      { name: "Blue Mosque", category: "landmark", area: "Kentron", avgTime: 1 },
      { name: "Dilijan Old Town", category: "neighborhood", area: "Dilijan", avgTime: 1.5 },
    ],
  },
  {
    key: "ladakh-spiti-manali",
    name: "Ladakh, Spiti & Manali",
    country: "India",
    places: [
      { name: "Leh Palace", category: "landmark", area: "Leh", avgTime: 1.5 },
      { name: "Shanti Stupa", category: "viewpoint", area: "Leh", avgTime: 1.5 },
      { name: "Thiksey Monastery", category: "landmark", area: "Leh Valley", avgTime: 1.5 },
      { name: "Hemis Monastery", category: "landmark", area: "Leh Valley", avgTime: 2 },
      { name: "Leh Market", category: "market", area: "Leh", avgTime: 1.5 },
      { name: "Pangong Lake", category: "viewpoint", area: "Ladakh", avgTime: 3 },
      { name: "Nubra Valley", category: "experience", area: "Ladakh", avgTime: 2.5 },
      { name: "Magnetic Hill", category: "landmark", area: "Leh", avgTime: 1 },
      { name: "Key Monastery", category: "landmark", area: "Spiti Valley", avgTime: 1.5 },
      { name: "Tabo Monastery", category: "landmark", area: "Spiti Valley", avgTime: 1.5 },
      { name: "Dhankar Monastery", category: "viewpoint", area: "Spiti Valley", avgTime: 2 },
      { name: "Chandratal Lake", category: "viewpoint", area: "Spiti Valley", avgTime: 2 },
      { name: "Kaza Town", category: "neighborhood", area: "Spiti Valley", avgTime: 1 },
      { name: "Kibber Village", category: "neighborhood", area: "Spiti Valley", avgTime: 1.5 },
      { name: "Hadimba Temple", category: "landmark", area: "Manali", avgTime: 1 },
      { name: "Old Manali Walk", category: "neighborhood", area: "Manali", avgTime: 1.5 },
      { name: "Solang Valley", category: "experience", area: "Manali", avgTime: 2 },
      { name: "Rohtang Pass", category: "viewpoint", area: "Manali", avgTime: 2.5 },
      { name: "Vashisht Hot Springs", category: "relax", area: "Manali", avgTime: 1.5 },
      { name: "Mall Road Manali", category: "market", area: "Manali", avgTime: 1 },
    ],
  },
  {
    key: "abu-dhabi",
    name: "Abu Dhabi",
    country: "UAE",
    places: [
      { name: "Sheikh Zayed Grand Mosque", category: "landmark", area: "Abu Dhabi Island", avgTime: 2 },
      { name: "Louvre Abu Dhabi", category: "museum", area: "Saadiyat Island", avgTime: 2.5 },
      { name: "Ferrari World", category: "experience", area: "Yas Island", avgTime: 3 },
      { name: "Corniche Beach", category: "relax", area: "Corniche", avgTime: 1.5 },
      { name: "Emirates Palace", category: "landmark", area: "West Corniche", avgTime: 1.5 },
      { name: "Qasr Al Hosn", category: "landmark", area: "Downtown", avgTime: 1.5 },
      { name: "Heritage Village", category: "museum", area: "Breakwater", avgTime: 1.5 },
      { name: "Saadiyat Island Beach", category: "relax", area: "Saadiyat Island", avgTime: 1.5 },
      { name: "Yas Marina Circuit", category: "experience", area: "Yas Island", avgTime: 2 },
      { name: "Warner Bros. World", category: "experience", area: "Yas Island", avgTime: 2.5 },
      { name: "Marina Mall", category: "market", area: "Breakwater", avgTime: 1.5 },
      { name: "Mangrove National Park", category: "park", area: "Eastern Mangroves", avgTime: 2 },
      { name: "Observation Deck at 300", category: "viewpoint", area: "Corniche", avgTime: 1 },
      { name: "Al Jahili Fort", category: "landmark", area: "Al Ain", avgTime: 1.5 },
      { name: "Al Ain Oasis", category: "park", area: "Al Ain", avgTime: 1.5 },
      { name: "Abu Dhabi Falcon Hospital", category: "experience", area: "Sweihan Road", avgTime: 2 },
      { name: "Abu Dhabi Mall", category: "market", area: "Tourist Club", avgTime: 1.5 },
      { name: "Yas Island Waterfront", category: "viewpoint", area: "Yas Island", avgTime: 1 },
    ],
  },
];

const CITY_ALIASES = {
  paris: "paris",
  "paris france": "paris",
  tokyo: "tokyo",
  "tokyo japan": "tokyo",
  "new york": "new-york",
  "new york city": "new-york",
  nyc: "new-york",
  yerevan: "yerevan",
  armenia: "yerevan",
  "yerevan armenia": "yerevan",
  ladakh: "ladakh-spiti-manali",
  spiti: "ladakh-spiti-manali",
  manali: "ladakh-spiti-manali",
  "ladakh spiti manali": "ladakh-spiti-manali",
  "ladakh spiti": "ladakh-spiti-manali",
  "spiti valley": "ladakh-spiti-manali",
  "himalayas north india": "ladakh-spiti-manali",
  "abu dhabi": "abu-dhabi",
  "abu dhabi uae": "abu-dhabi",
  uae: "abu-dhabi",
};

const FALLBACK_LABELS = {
  landmark: "signature landmark",
  museum: "local museum",
  neighborhood: "neighborhood walk",
  park: "city park",
  market: "market stop",
  experience: "cultural experience",
  food: "food district",
  nightlife: "evening spot",
  relax: "waterfront break",
  viewpoint: "scenic viewpoint",
};

function normalizeDestination(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(input) {
  return String(input || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function resolveCity(destination, rawInput) {
  const aliasKey = CITY_ALIASES[destination] || destination;
  const city = CITY_LIBRARY.find((entry) => entry.key === aliasKey);
  if (city) {
    return { city, isFallback: false };
  }
  return { city: buildFallbackCity(rawInput), isFallback: true };
}

function buildFallbackCity(rawInput) {
  const name = titleCase(String(rawInput || "Your Destination").trim()) || "Your Destination";
  const places = [
    { name: `${name} Historic Center Walk`, category: "neighborhood", area: "Old Town", avgTime: 1.5 },
    { name: `${name} Signature Landmark`, category: "landmark", area: "Central", avgTime: 1.2 },
    { name: `${name} City Museum`, category: "museum", area: "Museum Quarter", avgTime: 2 },
    { name: `${name} Riverfront Stroll`, category: "relax", area: "Riverside", avgTime: 1.5 },
    { name: `${name} Local Market`, category: "market", area: "Market District", avgTime: 1.5 },
    { name: `${name} Main Park`, category: "park", area: "Central", avgTime: 1.5 },
    { name: `${name} Cafe Lane`, category: "food", area: "Old Town", avgTime: 1 },
    { name: `${name} Cultural Center`, category: "experience", area: "Central", avgTime: 1.5 },
    { name: `${name} Sunset Viewpoint`, category: "viewpoint", area: "Hillside", avgTime: 1 },
    { name: `${name} Artisan Street`, category: "neighborhood", area: "Old Town", avgTime: 1.5 },
    { name: `${name} Food Hall`, category: "food", area: "Market District", avgTime: 1.5 },
    { name: `${name} Evening Market`, category: "nightlife", area: "Market District", avgTime: 1.5 },
    { name: `${name} Botanical Gardens`, category: "park", area: "Riverside", avgTime: 1.5 },
    { name: `${name} Heritage Museum`, category: "museum", area: "Museum Quarter", avgTime: 1.5 },
    { name: `${name} Scenic Plaza`, category: "landmark", area: "Central", avgTime: 1 },
  ];
  return { key: "custom", name, country: "Custom", places };
}

function normalizePace(pace) {
  const key = String(pace || "").toLowerCase().trim();
  return PACE_ALIASES[key] || "balanced";
}

function clampDays(days) {
  if (!Number.isFinite(days)) {
    return 3;
  }
  return Math.min(10, Math.max(1, Math.round(days)));
}

function hashSeed(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed) {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRandom(list, random) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function extractPlaces(pool, predicate, count) {
  const selected = [];
  const remaining = [];
  for (const place of pool) {
    if (selected.length < count && predicate(place)) {
      selected.push(place);
    } else {
      remaining.push(place);
    }
  }
  return { selected, remaining };
}

function createFallbackPlace(destination, index, category, area) {
  const label = FALLBACK_LABELS[category] || "local highlight";
  const suffix = index > 1 ? ` ${index}` : "";
  return {
    name: `${destination} ${label}${suffix}`,
    category,
    area: area || "Central",
    avgTime: 1.5,
  };
}

function selectPlaces({ pool, count, area, categories, destination, fallbackIndex }) {
  let remaining = pool;
  const selected = [];
  const areaFilter = (place) => (area ? place.area === area : true);
  const categoryFilter = (place) =>
    !categories || categories.length === 0 ? true : categories.includes(place.category);

  const take = (predicate, targetCount) => {
    if (targetCount <= 0) {
      return;
    }
    const result = extractPlaces(remaining, predicate, targetCount);
    selected.push(...result.selected);
    remaining = result.remaining;
  };

  take((place) => areaFilter(place) && categoryFilter(place), count);
  if (selected.length < count && area) {
    take((place) => areaFilter(place), count - selected.length);
  }
  if (selected.length < count) {
    take((place) => categoryFilter(place), count - selected.length);
  }
  if (selected.length < count) {
    take(() => true, count - selected.length);
  }

  let nextFallbackIndex = fallbackIndex;
  while (selected.length < count) {
    nextFallbackIndex += 1;
    const fallbackCategory = categories?.[nextFallbackIndex % categories.length] || "experience";
    selected.push(createFallbackPlace(destination, nextFallbackIndex, fallbackCategory, area));
  }

  return { selected, remaining, nextFallbackIndex };
}

function buildTripPlan({ destination, days, pace, seed }) {
  const cleanedDestination = String(destination || "").trim();
  const normalizedDestination = normalizeDestination(cleanedDestination);
  const paceKey = normalizePace(pace);
  const rules = TRIP_PACES[paceKey] || TRIP_PACES.balanced;
  const totalDays = clampDays(Number(days));
  const resolved = resolveCity(normalizedDestination, cleanedDestination);
  const city = resolved.city;
  const isFallback = resolved.isFallback;

  const randomSeed = hashSeed(`${normalizedDestination || cleanedDestination}-${seed || Date.now()}`);
  const random = mulberry32(randomSeed);
  const areaOrder = shuffleWithRandom(
    Array.from(new Set(city.places.map((place) => place.area).filter(Boolean))),
    random
  );
  let remainingPlaces = shuffleWithRandom(city.places, random);
  let fallbackIndex = 0;

  const itinerary = [];
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const dayArea = areaOrder.length ? areaOrder[dayIndex % areaOrder.length] : "";
    const slotCounts = SLOT_COUNTS[paceKey] || SLOT_COUNTS.balanced;
    let dayTotalHours = 0;

    const slots = TIME_SLOTS.map((slotName, slotIndex) => {
      const count = slotCounts[slotIndex] || 1;
      const result = selectPlaces({
        pool: remainingPlaces,
        count,
        area: dayArea,
        categories: SLOT_CATEGORIES[slotName],
        destination: city.name,
        fallbackIndex,
      });
      remainingPlaces = result.remaining;
      fallbackIndex = result.nextFallbackIndex;
      const items = result.selected.map((place) => ({
        name: place.name,
        category: place.category,
        durationHours: place.avgTime,
      }));
      const slotHours = items.reduce((sum, item) => sum + item.durationHours, 0);
      dayTotalHours += slotHours;
      return {
        timeOfDay: slotName,
        items,
        totalHours: Number(slotHours.toFixed(1)),
      };
    });

    itinerary.push({
      day: dayIndex + 1,
      area: dayArea,
      totalHours: Number(dayTotalHours.toFixed(1)),
      slots,
    });
  }

  const totalStops = itinerary.reduce(
    (sum, day) =>
      sum + day.slots.reduce((slotSum, slot) => slotSum + slot.items.length, 0),
    0
  );
  const totalHours = itinerary.reduce((sum, day) => sum + day.totalHours, 0);

  return {
    destination: city.name,
    pace: paceKey,
    days: totalDays,
    generatedAt: new Date().toISOString(),
    isFallback,
    meta: {
      totalStops,
      avgStopsPerDay: Number((totalStops / totalDays).toFixed(1)),
      avgHoursPerDay: Number((totalHours / totalDays).toFixed(1)),
      maxHoursPerDay: rules.maxHours,
      maxStopsPerDay: rules.maxStopsPerDay,
    },
    itinerary,
  };
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Token invalid but we continue anyway for optional auth
  }
  next();
};

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: "Authorization token required.",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      error: "Authorization token required.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token.",
    });
  }
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
    });
  }
  next();
};

// ============================================================================
// SWAGGER UI
// ============================================================================

// Serve swagger spec as JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Serve Swagger UI using CDN (works reliably on Vercel)
app.get("/api-docs", (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TripMaker API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true
      });
    };
  </script>
</body>
</html>
  `;
  res.send(html);
});

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Check server health
 *     description: Returns the current health status of the server with uptime information
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "ok"
 *               timestamp: "2026-01-30T10:30:00.000Z"
 *               uptime: 3600.5
 */
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @swagger
 * /register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Creates a new user account with email and password. Returns user info and JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address (must be unique)
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: User password (minimum 6 characters)
 *                 example: SecurePassword123
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               email: "user@example.com"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               createdAt: "2026-01-30T10:30:00.000Z"
 *       400:
 *         description: Validation error (missing fields or invalid email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingFields:
 *                 value:
 *                   error: "Email and password are required."
 *               invalidEmail:
 *                 value:
 *                   error: "Please provide a valid email address."
 *               passwordTooShort:
 *                 value:
 *                   error: "Password must be at least 6 characters long."
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email is already registered."
 *       429:
 *         description: Too many registration attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Too many registration attempts, please try again later."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post(
  "/register",
  registerLimiter,
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const password = String(req.body?.password || "");

      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required.",
        });
      }

      const users = await readUsers();
      const existing = users.find((user) => user.email === email);

      if (existing) {
        return res.status(409).json({
          error: "Email is already registered.",
        });
      }

      const newUser = {
        id: crypto.randomUUID(),
        email,
        passwordHash: hashPassword(password),
        trips: [],
        profile: { ...DEFAULT_PROFILE },
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await writeUsers(users);

      const token = generateToken(newUser);

      return res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        token,
        createdAt: newUser.createdAt,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate user
 *     description: Validates user credentials and returns user info with JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: SecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               email: "user@example.com"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               message: "Login successful."
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email and password are required."
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid credentials."
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Too many login attempts, please try again later."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post(
  "/login",
  loginLimiter,
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required."),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const password = String(req.body?.password || "");

      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required.",
        });
      }

      const users = await readUsers();
      const user = users.find((candidate) => candidate.email === email);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({
          error: "Invalid credentials.",
        });
      }

      const token = generateToken(user);

      return res.status(200).json({
        id: user.id,
        email: user.email,
        token,
        message: "Login successful.",
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /trips/plan:
 *   post:
 *     tags: [Trips]
 *     summary: Generate a draft trip itinerary
 *     description: Builds a day-by-day plan using static city data and simple rules (no live APIs).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destination
 *             properties:
 *               destination:
 *                 type: string
 *                 description: City or destination name
 *                 example: "Paris"
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 3
 *               pace:
 *                 type: string
 *                 description: relaxed | balanced | fast
 *                 example: "balanced"
 *               seed:
 *                 type: number
 *                 description: Optional seed for regeneration
 *                 example: 1700000000000
 *     responses:
 *       200:
 *         description: Trip plan generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TripPlan'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post(
  "/trips/plan",
  [
    body("destination").trim().notEmpty().withMessage("Destination is required."),
    body("days").optional().isInt({ min: 1, max: 10 }).withMessage("Days must be 1-10."),
    body("pace").optional().isString().withMessage("Pace must be a string."),
    body("seed").optional().isNumeric().withMessage("Seed must be a number."),
  ],
  handleValidationErrors,
  (req, res, next) => {
    try {
      const { destination, days, pace, seed } = req.body || {};
      const plan = buildTripPlan({ destination, days, pace, seed });
      return res.status(200).json(plan);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /trips/agent/chat:
 *   post:
 *     tags: [Trips]
 *     summary: Chat with AI trip agent
 *     description: Send messages and context; returns a trip plan (same shape as POST /trips/plan). Falls back to static planner if AI unavailable or errors.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *               - context
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     content: { type: string }
 *               context:
 *                 type: object
 *                 properties:
 *                   destination: { type: string }
 *                   days: { type: integer, minimum: 1, maximum: 10 }
 *                   pace: { type: string }
 *                   currentItinerary: { type: array }
 *     responses:
 *       200:
 *         description: Trip plan (from AI or fallback)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TripPlan'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
app.post(
  "/trips/agent/chat",
  tripAgentLimiter,
  [
    body("messages").isArray().withMessage("messages must be an array."),
    body("context").optional().isObject().withMessage("context must be an object."),
    body("context.destination").optional().isString(),
    body("context.days").optional().isInt({ min: 1, max: 10 }),
    body("context.pace").optional().isString(),
    body("context.currentItinerary").optional().isArray(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { messages = [], context = {} } = req.body || {};
      const destination = (context.destination && String(context.destination).trim()) || "Your Trip";
      const days = Math.min(10, Math.max(1, Number(context.days) || 3));
      const pace = context.pace || "balanced";
      const fallbackPlan = () =>
        buildTripPlan({ destination, days, pace, seed: Date.now() });

      const adapters = getTripAgentAdapters();
      const contextForAdapter = {
        destination,
        days,
        pace,
        currentItinerary: context.currentItinerary,
      };
      if (adapters.length === 0) {
        if (process.env.NODE_ENV !== "production") {
          console.log("Trip agent: no API keys set (GEMINI_API_KEY / GROQ_API_KEY); using static plan.");
        }
        return res.status(200).json(fallbackPlan());
      }
      if (process.env.NODE_ENV !== "production") {
        console.log("Trip agent: trying", adapters.map((a) => a.name).join(" then "));
      }
      for (const adapter of adapters) {
        try {
          const plan = await adapter.generateTripFromChat(messages, contextForAdapter);
          if (process.env.NODE_ENV !== "production") {
            console.log("Trip agent: responded via", adapter.name);
          }
          return res.status(200).json(plan);
        } catch (aiError) {
          console.warn(
            `Trip agent [${adapter.name}] failed, trying next:`,
            aiError?.message || aiError
          );
        }
      }
      if (process.env.NODE_ENV !== "production") {
        console.log("Trip agent: all adapters failed; using static plan (agentUnavailable).");
      }
      const plan = fallbackPlan();
      return res.status(200).json({ ...plan, agentUnavailable: true });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /trips:
 *   post:
 *     tags: [Trips]
 *     summary: Create a new trip
 *     description: Saves a generated itinerary to the authenticated user's trips list.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - destination
 *               - itinerary
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Paris Family Vacation"
 *               destination:
 *                 type: string
 *                 example: "Paris"
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 3
 *               pace:
 *                 type: string
 *                 description: relaxed | balanced | fast
 *                 example: "balanced"
 *               itinerary:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TripPlanDay'
 *     responses:
 *       201:
 *         description: Trip created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post(
  "/trips",
  requireAuth,
  [
    body("name").trim().notEmpty().withMessage("Trip name is required."),
    body("destination").trim().notEmpty().withMessage("Destination is required."),
    body("itinerary").isArray({ min: 1 }).withMessage("Itinerary must be an array."),
    body("days").optional().isInt({ min: 1, max: 10 }).withMessage("Days must be 1-10."),
    body("pace").optional().isString().withMessage("Pace must be a string."),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const users = await readUsers();
      const user = users.find((candidate) => candidate.id === userId);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const name = String(req.body?.name || "").trim();
      const destination = String(req.body?.destination || "").trim();
      const itinerary = Array.isArray(req.body?.itinerary) ? req.body.itinerary : [];
      const paceInput = req.body?.pace;

      let normalizedPace = "balanced";
      if (paceInput) {
        const paceKey = PACE_ALIASES[String(paceInput).toLowerCase().trim()];
        if (!paceKey) {
          return res.status(400).json({
            error: "Pace must be relaxed, balanced, or fast.",
          });
        }
        normalizedPace = paceKey;
      }

      const daysCandidate = Number.isInteger(Number(req.body?.days))
        ? Number(req.body?.days)
        : itinerary.length;

      if (!Number.isInteger(daysCandidate) || daysCandidate < 1 || daysCandidate > 10) {
        return res.status(400).json({ error: "Days must be 1-10." });
      }

      let transportMode = null;
      const tm = String(req.body?.transportMode || "").toLowerCase().trim();
      if (tm && TRANSPORT_MODES.includes(tm)) transportMode = tm;

      const isPublic = Boolean(req.body?.isPublic);

      const timestamp = new Date().toISOString();
      const trip = {
        id: crypto.randomUUID(),
        userId,
        name,
        destination,
        days: daysCandidate,
        pace: normalizedPace,
        status: "upcoming",
        itinerary,
        transportMode: transportMode || undefined,
        isPublic,
        thumbnailKey: undefined,
        gallery: [],
        prerequisites: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      ensureTrips(user);
      user.trips.push(trip);
      await writeUsers(users);

      return res.status(201).json(trip);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /trips:
 *   get:
 *     tags: [Trips]
 *     summary: List user trips
 *     description: Returns the authenticated user's trips, sorted by createdAt (newest first).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, active, completed, archived]
 *         description: Optional filter by trip status
 *     responses:
 *       200:
 *         description: List of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trips:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
app.get("/trips", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const users = await readUsers();
    const user = users.find((candidate) => candidate.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    ensureTrips(user);
    let trips = [...(user.trips || [])];
    for (const u of users) {
      if (u.id === userId) continue;
      ensureTrips(u);
      for (const t of u.trips || []) {
        ensureCollaborators(t);
        if ((t.collaborators || []).some((c) => c.userId === userId)) {
          trips.push({ ...t, ownerEmail: u.email, isCollaborator: true });
        }
      }
    }
    const statusFilter = String(req.query?.status || "").trim();
    if (statusFilter && ["upcoming", "active", "completed", "archived"].includes(statusFilter)) {
      trips = trips.filter((t) => t.status === statusFilter);
    }
    trips.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    return res.status(200).json({ trips });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /trips/feed:
 *   get:
 *     tags: [Trips]
 *     summary: Public trip feed (MVP2)
 *     description: Returns trips marked public. No auth required.
 *     parameters:
 *       - in: query
 *         name: destination
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Public trips
 */
app.get("/trips/feed", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const users = await readUsers();
    const allTrips = users.flatMap((u) => {
      ensureTrips(u);
      return (u.trips || []).map((t) => {
        ensureLikes(t);
        ensureComments(t);
        ensureGallery(t);
        const likeCount = (t.likes || []).length;
        const commentCount = (t.comments || []).length;
        const userLiked = userId && (t.likes || []).includes(userId);
        const galleryPreview = (t.gallery || []).slice(0, 5).map((i) => i.imageKey).filter(Boolean);
        return { ...t, ownerEmail: u.email, likeCount, commentCount, userLiked, galleryPreview };
      });
    });
    let trips = allTrips.filter((t) => Boolean(t.isPublic));
    const destFilter = String(req.query?.destination || "").trim();
    if (destFilter) {
      const lower = destFilter.toLowerCase();
      trips = trips.filter((t) => String(t.destination || "").toLowerCase().includes(lower));
    }
    const interestFilter = String(req.query?.interest || "").trim();
    if (interestFilter) {
      const lower = interestFilter.toLowerCase();
      trips = trips.filter((t) => {
        const dest = String(t.destination || "").toLowerCase();
        const name = String(t.name || "").toLowerCase();
        return dest.includes(lower) || name.includes(lower);
      });
    }
    const limit = Math.min(50, Math.max(1, Number(req.query?.limit) || 20));
    trips.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    trips = trips.slice(0, limit);
    return res.status(200).json({ trips });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /trips/{id}:
 *   get:
 *     tags: [Trips]
 *     summary: Get trip by ID
 *     description: Returns a single trip. Trip must belong to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trip found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found or not owned by user
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
app.get("/trips/:id", optionalAuth, [param("id").notEmpty().withMessage("Trip ID is required.")], handleValidationErrors, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tripId = String(req.params.id || "");
    const users = await readUsers();

    // Resolve trip and owner (by id only; no access check yet)
    let resolvedTrip = null;
    let ownerUser = null;
    for (const u of users) {
      ensureTrips(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (t) {
        resolvedTrip = t;
        ownerUser = u;
        break;
      }
    }
    if (!resolvedTrip) return res.status(404).json({ error: "Trip not found." });
    ensureGallery(resolvedTrip);
    ensurePrerequisites(resolvedTrip);

    // Access: owner or collaborator may always see the trip (including private)
    if (userId) {
      if (resolvedTrip.userId === userId) return res.status(200).json(resolvedTrip);
      ensureCollaborators(resolvedTrip);
      if ((resolvedTrip.collaborators || []).some((c) => c.userId === userId)) {
        return res.status(200).json({ ...resolvedTrip, ownerEmail: ownerUser?.email, isCollaborator: true });
      }
    }

    // Private trips: never return to unauthenticated or non-owner/non-collaborator (404, do not leak existence)
    if (resolvedTrip.isPublic !== true) return res.status(404).json({ error: "Trip not found." });

    return res.status(200).json({ ...resolvedTrip, ownerEmail: ownerUser?.email });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /trips/{id}:
 *   put:
 *     tags: [Trips]
 *     summary: Update trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               destination: { type: string }
 *               days: { type: integer }
 *               pace: { type: string }
 *               status: { type: string, enum: [upcoming, active, completed, archived] }
 *               itinerary: { type: array }
 *     responses:
 *       200:
 *         description: Trip updated
 *       404:
 *         description: Trip not found
 *       401:
 *         description: Unauthorized
 */
app.put(
  "/trips/:id",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const users = await readUsers();
      const user = users.find((c) => c.id === userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      ensureTrips(user);
      let trip = (user.trips || []).find((t) => t.id === tripId);
      let ownerUser = user;
      if (!trip) {
        for (const u of users) {
          ensureTrips(u);
          const t = (u.trips || []).find((x) => x.id === tripId);
          if (!t) continue;
          ensureCollaborators(t);
          const collab = (t.collaborators || []).find((c) => c.userId === userId);
          if (collab) {
            if (collab.role === "editor") {
              trip = t;
              ownerUser = u;
              break;
            }
            return res.status(403).json({ error: "Viewers cannot edit this trip." });
          }
        }
      }
      if (!trip) return res.status(404).json({ error: "Trip not found." });

      const allowed = ["name", "destination", "days", "pace", "status", "itinerary", "transportMode", "isPublic", "thumbnailKey"];
      const statusValues = ["upcoming", "active", "completed", "archived"];
      for (const key of allowed) {
        if (req.body[key] === undefined) continue;
        if (key === "status") {
          if (statusValues.includes(String(req.body[key]))) trip.status = req.body[key];
          continue;
        }
        if (key === "transportMode") {
          const tm = String(req.body[key] || "").toLowerCase().trim();
          trip.transportMode = TRANSPORT_MODES.includes(tm) ? tm : undefined;
          continue;
        }
        if (key === "isPublic") {
          trip.isPublic = Boolean(req.body[key]);
          continue;
        }
        if (key === "name" || key === "destination") {
          trip[key] = String(req.body[key] ?? "").trim();
          continue;
        }
        if (key === "days") {
          const n = Number(req.body[key]);
          if (Number.isInteger(n) && n >= 1 && n <= 10) trip.days = n;
          continue;
        }
        if (key === "pace") {
          const p = PACE_ALIASES[String(req.body[key] || "").toLowerCase().trim()];
          if (p) trip.pace = p;
          continue;
        }
        if (key === "itinerary" && Array.isArray(req.body[key])) trip.itinerary = req.body[key];
        if (key === "thumbnailKey") {
          const val = req.body[key];
          if (val === null || val === "") {
            trip.thumbnailKey = undefined;
            continue;
          }
          const str = String(val).trim();
          if (!str) {
            trip.thumbnailKey = undefined;
            continue;
          }
          const prefix = `uploads/${user.id}/`;
          if (!str.startsWith(prefix)) return res.status(400).json({ error: "Invalid thumbnail key." });
          try {
            const objectSize = await getObjectSizeR2(str);
            if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: "Thumbnail image not found. Upload first." });
          } catch (e) {
            return res.status(400).json({ error: "Thumbnail image not found." });
          }
          trip.thumbnailKey = str;
          continue;
        }
      }
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(200).json(trip);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /trips/{id}:
 *   delete:
 *     tags: [Trips]
 *     summary: Delete trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trip deleted
 *       404:
 *         description: Trip not found
 *       401:
 *         description: Unauthorized
 */
app.delete(
  "/trips/:id",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const users = await readUsers();
      const user = users.find((c) => c.id === userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      ensureTrips(user);
      let trip = (user.trips || []).find((t) => t.id === tripId);
      let ownerUser = user;
      if (!trip) {
        for (const u of users) {
          ensureTrips(u);
          const t = (u.trips || []).find((x) => x.id === tripId);
          if (!t) continue;
          ensureCollaborators(t);
          const collab = (t.collaborators || []).find((c) => c.userId === userId);
          if (collab) {
            return res.status(403).json({ error: "Only the owner can delete this trip." });
          }
        }
        return res.status(404).json({ error: "Trip not found." });
      }
      const idx = ownerUser.trips.findIndex((t) => t.id === tripId);
      if (idx === -1) return res.status(404).json({ error: "Trip not found." });
      ownerUser.trips.splice(idx, 1);
      await writeUsers(users);
      return res.status(200).json({ message: "Trip deleted." });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /trips/{id}/archive:
 *   patch:
 *     tags: [Trips]
 *     summary: Archive trip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trip archived
 *       404:
 *         description: Trip not found
 *       401:
 *         description: Unauthorized
 */
app.patch(
  "/trips/:id/archive",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const users = await readUsers();
      const user = users.find((c) => c.id === userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      ensureTrips(user);
      const trip = (user.trips || []).find((t) => t.id === tripId);
      if (!trip) return res.status(404).json({ error: "Trip not found." });
      trip.status = "archived";
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(200).json(trip);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /trips/{id}/unarchive:
 *   patch:
 *     tags: [Trips]
 *     summary: Unarchive a trip
 *     description: Sets trip status back to upcoming. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trip unarchived
 *       404:
 *         description: Trip not found
 *       401:
 *         description: Unauthorized
 */
app.patch(
  "/trips/:id/unarchive",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const users = await readUsers();
      const user = users.find((c) => c.id === userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      ensureTrips(user);
      const trip = (user.trips || []).find((t) => t.id === tripId);
      if (!trip) return res.status(404).json({ error: "Trip not found." });
      trip.status = "upcoming";
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(200).json(trip);
    } catch (error) {
      return next(error);
    }
  }
);

const INVITE_ROLES = ["viewer", "editor"];
const INVITE_EXPIRY_HOURS = 24;

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

app.post(
  "/trips/:id/invite",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const role = INVITE_ROLES.includes(String(req.body?.role || "").toLowerCase())
        ? String(req.body.role).toLowerCase()
        : "viewer";
      const users = await readUsers();
      const user = users.find((c) => c.id === userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      ensureTrips(user);
      const trip = (user.trips || []).find((t) => t.id === tripId);
      if (!trip) return res.status(404).json({ error: "Trip not found." });
      ensureInvites(trip);
      const code = generateInviteCode();
      const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
      trip.invites.push({ code, role, expiresAt, createdAt: new Date().toISOString() });
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(201).json({ code, role, expiresAt });
    } catch (error) {
      return next(error);
    }
  }
);

// MVP3.6: Upload presign (R2)
app.post(
  "/upload/presign",
  requireAuth,
  [body("size").isInt({ min: 1 }).withMessage("Valid size (bytes) is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      if (!isR2Configured()) {
        return res.status(503).json({ error: "Upload service is not configured.", message: "R2 credentials missing." });
      }
      const size = Number(req.body?.size) || 0;
      const contentType = String(req.body?.contentType || "").trim() || "application/octet-stream";
      if (size > MAX_FILE_BYTES) {
        return res.status(413).json({ error: "File too large.", message: "Maximum 5 MB per file." });
      }
      const users = await readUsers();
      const user = users.find((u) => u.id === req.user?.id);
      if (!user) return res.status(404).json({ error: "User not found." });
      const profile = ensureProfile(user);
      const used = profile.storageUsed || 0;
      if (used + size > STORAGE_LIMIT_BYTES) {
        return res.status(413).json({
          error: "Storage limit exceeded.",
          message: `You have used ${Math.round(used / 1024 / 1024)} MB of ${STORAGE_LIMIT_BYTES / 1024 / 1024} MB.`,
          usedBytes: used,
          limitBytes: STORAGE_LIMIT_BYTES,
        });
      }
      const ext = contentType === "image/png" ? "png" : contentType === "image/gif" ? "gif" : contentType === "image/webp" ? "webp" : "jpg";
      const key = `uploads/${user.id}/${crypto.randomUUID()}.${ext}`;
      const result = await getPresignedPutUrl(key, contentType);
      if (!result) return res.status(503).json({ error: "Failed to generate upload URL." });
      return res.status(200).json({ uploadUrl: result.uploadUrl, key: result.key, expiresIn: 900 });
    } catch (error) {
      return next(error);
    }
  }
);

// MVP3.6: Media redirect (presigned GET for R2 object)
app.get(/^\/media\/(.+)/, async (req, res, next) => {
  try {
    let key = req.params[0];
    try {
      key = decodeURIComponent(key);
    } catch {
      return res.status(400).json({ error: "Invalid key." });
    }
    if (!key || !key.startsWith("uploads/")) return res.status(400).json({ error: "Invalid key." });
    if (!isR2Configured()) return res.status(503).json({ error: "Media service is not configured." });
    const url = await getPresignedGetUrl(key);
    if (!url) return res.status(503).json({ error: "Failed to generate media URL." });
    res.setHeader("Location", url);
    res.setHeader("Cache-Control", "private, max-age=3600");
    return res.status(302).redirect(url);
  } catch (error) {
    return next(error);
  }
});

app.delete(
  "/trips/:id/collaborators/:userId",
  requireAuth,
  [
    param("id").notEmpty().withMessage("Trip ID is required."),
    param("userId").notEmpty().withMessage("Collaborator user ID is required."),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const authUserId = req.user?.id;
      const tripId = String(req.params.id || "");
      const collaboratorUserId = String(req.params.userId || "");
      const users = await readUsers();
      const authUser = users.find((c) => c.id === authUserId);
      if (!authUser) return res.status(404).json({ error: "User not found." });
      ensureTrips(authUser);
      let trip = (authUser.trips || []).find((t) => t.id === tripId);
      let ownerUser = authUser;
      if (!trip) {
        for (const u of users) {
          ensureTrips(u);
          const t = (u.trips || []).find((x) => x.id === tripId);
          if (!t) continue;
          ensureCollaborators(t);
          const collab = (t.collaborators || []).find((c) => c.userId === authUserId);
          if (collab) {
            trip = t;
            ownerUser = u;
            break;
          }
        }
      }
      if (!trip || !ownerUser) return res.status(404).json({ error: "Trip not found." });
      ensureCollaborators(trip);
      if (trip.userId === collaboratorUserId) return res.status(400).json({ error: "Cannot remove the trip owner." });
      const isOwner = trip.userId === authUserId;
      const collab = (trip.collaborators || []).find((c) => c.userId === authUserId);
      const isEditor = collab && collab.role === "editor";
      if (!isOwner && !isEditor) return res.status(403).json({ error: "Only the trip owner or an editor can remove collaborators." });
      const targetCollab = (trip.collaborators || []).find((c) => c.userId === collaboratorUserId);
      if (!targetCollab) return res.status(404).json({ error: "Collaborator not found on this trip." });
      if (targetCollab.role === "editor" && !isOwner) return res.status(403).json({ error: "Only the owner can remove editors." });
      trip.collaborators = trip.collaborators.filter((c) => c.userId !== collaboratorUserId);
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(200).json({ message: "Collaborator removed.", collaborators: trip.collaborators });
    } catch (error) {
      return next(error);
    }
  }
);

// Helper: find trip and owner by tripId; authUser must be owner or collaborator. Returns { trip, ownerUser } or null.
function findTripAndOwnerForCollaborator(users, tripId, authUserId) {
  const authUser = users.find((c) => c.id === authUserId);
  if (!authUser) return null;
  ensureTrips(authUser);
  let trip = (authUser.trips || []).find((t) => t.id === tripId);
  let ownerUser = authUser;
  if (!trip) {
    for (const u of users) {
      ensureTrips(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      ensureCollaborators(t);
      if ((t.collaborators || []).some((c) => c.userId === authUserId)) {
        trip = t;
        ownerUser = u;
        break;
      }
    }
  }
  if (!trip) return null;
  const isOwner = trip.userId === authUserId;
  const collab = (trip.collaborators || []).find((c) => c.userId === authUserId);
  if (!isOwner && !collab) return null;
  return { trip, ownerUser };
}

const PREREQUISITE_CATEGORIES = ["documents", "clothing", "electronics", "medicine", "other"];
const PREREQUISITE_STATUSES = ["pending", "done"];

app.post(
  "/trips/:id/prerequisites",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const title = String((req.body && req.body.title) || "").trim();
      if (!title) return res.status(400).json({ error: "Prerequisite title is required." });
      const users = await readUsers();
      const found = findTripAndOwnerForCollaborator(users, tripId, userId);
      if (!found) return res.status(404).json({ error: "Trip not found." });
      const { trip, ownerUser } = found;
      ensurePrerequisites(trip);
      let description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
      let category = typeof req.body?.category === "string" ? req.body.category.trim().toLowerCase() : "";
      if (category && !PREREQUISITE_CATEGORIES.includes(category)) category = "other";
      const imageKey = typeof req.body?.imageKey === "string" ? req.body.imageKey.trim() : undefined;
      let assigneeUserId = typeof req.body?.assigneeUserId === "string" ? req.body.assigneeUserId.trim() : undefined;
      if (assigneeUserId === "") assigneeUserId = undefined;
      const isActive = trip.status === "active";
      if (assigneeUserId && !isActive) assigneeUserId = undefined;
      let assigneeEmail = undefined;
      if (assigneeUserId) {
        const assignee = (trip.collaborators || []).find((c) => c.userId === assigneeUserId);
        if (assignee) assigneeEmail = assignee.email;
        else {
          const ownerIsAssignee = trip.userId === assigneeUserId;
          if (ownerIsAssignee) {
            const owner = users.find((u) => u.id === trip.userId);
            if (owner) assigneeEmail = owner.email;
          }
        }
      }
      const item = {
        id: crypto.randomUUID(),
        title,
        description: description || undefined,
        category: category || undefined,
        imageKey: imageKey || undefined,
        assigneeUserId: assigneeUserId || undefined,
        assigneeEmail: assigneeEmail || undefined,
        status: "pending",
        createdAt: new Date().toISOString(),
        createdBy: userId,
      };
      trip.prerequisites.push(item);
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(201).json(item);
    } catch (error) {
      return next(error);
    }
  }
);

app.put(
  "/trips/:id/prerequisites/:itemId",
  requireAuth,
  [
    param("id").notEmpty().withMessage("Trip ID is required."),
    param("itemId").notEmpty().withMessage("Prerequisite item ID is required."),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const itemId = String(req.params.itemId || "");
      const users = await readUsers();
      const found = findTripAndOwnerForCollaborator(users, tripId, userId);
      if (!found) return res.status(404).json({ error: "Trip not found." });
      const { trip } = found;
      ensurePrerequisites(trip);
      if (trip.status === "completed") return res.status(403).json({ error: "Cannot edit prerequisites when trip is completed." });
      const item = trip.prerequisites.find((p) => p.id === itemId);
      if (!item) return res.status(404).json({ error: "Prerequisite item not found." });
      if (typeof req.body?.title === "string") {
        const t = req.body.title.trim();
        if (t) item.title = t;
      }
      if (req.body && "description" in req.body) item.description = typeof req.body.description === "string" ? req.body.description.trim() || undefined : undefined;
      if (req.body && "category" in req.body) {
        const c = typeof req.body.category === "string" ? req.body.category.trim().toLowerCase() : "";
        item.category = c && PREREQUISITE_CATEGORIES.includes(c) ? c : "other";
      }
      if (req.body && "imageKey" in req.body) item.imageKey = typeof req.body.imageKey === "string" ? req.body.imageKey.trim() || undefined : undefined;
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(200).json(trip);
    } catch (error) {
      return next(error);
    }
  }
);

app.patch(
  "/trips/:id/prerequisites/:itemId",
  requireAuth,
  [
    param("id").notEmpty().withMessage("Trip ID is required."),
    param("itemId").notEmpty().withMessage("Prerequisite item ID is required."),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const itemId = String(req.params.itemId || "");
      const users = await readUsers();
      const found = findTripAndOwnerForCollaborator(users, tripId, userId);
      if (!found) return res.status(404).json({ error: "Trip not found." });
      const { trip } = found;
      if (trip.status !== "active") return res.status(403).json({ error: "Assign and status updates only allowed when trip is active." });
      ensurePrerequisites(trip);
      const item = trip.prerequisites.find((p) => p.id === itemId);
      if (!item) return res.status(404).json({ error: "Prerequisite item not found." });
      if (req.body && "assigneeUserId" in req.body) {
        const val = req.body.assigneeUserId;
        if (val === null || val === undefined || val === "") {
          item.assigneeUserId = undefined;
          item.assigneeEmail = undefined;
        } else {
          const uid = String(val).trim();
          const collab = (trip.collaborators || []).find((c) => c.userId === uid);
          if (collab) {
            item.assigneeUserId = uid;
            item.assigneeEmail = collab.email;
          } else if (trip.userId === uid) {
            const owner = users.find((u) => u.id === trip.userId);
            if (owner) {
              item.assigneeUserId = uid;
              item.assigneeEmail = owner.email;
            }
          }
        }
      }
      if (req.body && typeof req.body.status === "string" && PREREQUISITE_STATUSES.includes(req.body.status)) {
        item.status = req.body.status;
      }
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(200).json(trip);
    } catch (error) {
      return next(error);
    }
  }
);

app.delete(
  "/trips/:id/prerequisites/:itemId",
  requireAuth,
  [
    param("id").notEmpty().withMessage("Trip ID is required."),
    param("itemId").notEmpty().withMessage("Prerequisite item ID is required."),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const itemId = String(req.params.itemId || "");
      const users = await readUsers();
      const found = findTripAndOwnerForCollaborator(users, tripId, userId);
      if (!found) return res.status(404).json({ error: "Trip not found." });
      const { trip } = found;
      ensurePrerequisites(trip);
      if (trip.status === "completed") return res.status(403).json({ error: "Cannot delete prerequisites when trip is completed." });
      const idx = trip.prerequisites.findIndex((p) => p.id === itemId);
      if (idx === -1) return res.status(404).json({ error: "Prerequisite item not found." });
      trip.prerequisites.splice(idx, 1);
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(200).json(trip);
    } catch (error) {
      return next(error);
    }
  }
);

app.get(
  "/trips/:id/messages",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
      const offset = Math.max(0, Number(req.query?.offset) || 0);
      const users = await readUsers();
      const authUser = users.find((c) => c.id === userId);
      if (!authUser) return res.status(404).json({ error: "User not found." });
      ensureTrips(authUser);
      let trip = (authUser.trips || []).find((t) => t.id === tripId);
      if (!trip) {
        for (const u of users) {
          ensureTrips(u);
          const t = (u.trips || []).find((x) => x.id === tripId);
          if (!t) continue;
          if ((t.collaborators || []).some((c) => c.userId === userId)) {
            trip = t;
            break;
          }
        }
      }
      if (!trip) return res.status(404).json({ error: "Trip not found." });
      ensureMessages(trip);
      const sorted = [...trip.messages].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      const messages = sorted.slice(offset, offset + limit);
      return res.status(200).json({ messages, total: trip.messages.length });
    } catch (error) {
      return next(error);
    }
  }
);

app.post(
  "/trips/:id/messages",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const text = String((req.body && req.body.text) || "").trim();
      const imageKey = typeof req.body?.imageKey === "string" ? req.body.imageKey.trim() : "";
      if (!text && !imageKey) return res.status(400).json({ error: "Message text or image is required." });
      const users = await readUsers();
      const authUser = users.find((c) => c.id === userId);
      if (!authUser) return res.status(404).json({ error: "User not found." });
      ensureTrips(authUser);
      let trip = (authUser.trips || []).find((t) => t.id === tripId);
      let ownerUser = authUser;
      if (!trip) {
        for (const u of users) {
          ensureTrips(u);
          const t = (u.trips || []).find((x) => x.id === tripId);
          if (!t) continue;
          const collab = (t.collaborators || []).find((c) => c.userId === userId);
          if (collab) {
            trip = t;
            ownerUser = u;
            break;
          }
        }
      }
      if (!trip) return res.status(404).json({ error: "Trip not found." });
      ensureMessages(trip);
      const collab = (trip.collaborators || []).find((c) => c.userId === userId);
      const canPost = trip.userId === userId || (collab && collab.role === "editor");
      if (!canPost) return res.status(403).json({ error: "Only trip owner or editors can post messages." });

      let sizeToAdd = 0;
      if (imageKey) {
        const prefix = `uploads/${authUser.id}/`;
        if (!imageKey.startsWith(prefix)) return res.status(400).json({ error: "Invalid image key." });
        const objectSize = await getObjectSizeR2(imageKey);
        if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: "Image not found or invalid. Upload first." });
        const profile = ensureProfile(authUser);
        const used = profile.storageUsed || 0;
        if (used + objectSize > STORAGE_LIMIT_BYTES) return res.status(413).json({ error: "Storage limit exceeded." });
        sizeToAdd = objectSize;
      }

      const message = {
        id: crypto.randomUUID(),
        userId,
        text: text || "",
        createdAt: new Date().toISOString(),
      };
      if (imageKey) message.imageKey = imageKey;
      trip.messages.push(message);

      if (sizeToAdd > 0) {
        const profile = ensureProfile(authUser);
        profile.storageUsed = (profile.storageUsed || 0) + sizeToAdd;
      }

      await writeUsers(users);
      return res.status(201).json(message);
    } catch (error) {
      return next(error);
    }
  }
);

app.post(
  "/trips/:id/like",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const users = await readUsers();
      let trip = null;
      for (const u of users) {
        ensureTrips(u);
        const t = (u.trips || []).find((x) => x.id === tripId);
        if (!t || !t.isPublic) continue;
        trip = t;
        break;
      }
      if (!trip) return res.status(404).json({ error: "Trip not found or not public." });
      ensureLikes(trip);
      if (!trip.likes.includes(userId)) trip.likes.push(userId);
      await writeUsers(users);
      return res.status(200).json({ liked: true, likeCount: trip.likes.length });
    } catch (error) {
      return next(error);
    }
  }
);

app.delete(
  "/trips/:id/like",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const users = await readUsers();
      let trip = null;
      for (const u of users) {
        ensureTrips(u);
        const t = (u.trips || []).find((x) => x.id === tripId);
        if (!t || !t.isPublic) continue;
        trip = t;
        break;
      }
      if (!trip) return res.status(404).json({ error: "Trip not found or not public." });
      ensureLikes(trip);
      const idx = trip.likes.indexOf(userId);
      if (idx !== -1) trip.likes.splice(idx, 1);
      await writeUsers(users);
      return res.status(200).json({ liked: false, likeCount: trip.likes.length });
    } catch (error) {
      return next(error);
    }
  }
);

app.get(
  "/trips/:id/comments",
  optionalAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const tripId = String(req.params.id || "");
      const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
      const offset = Math.max(0, Number(req.query?.offset) || 0);
      const users = await readUsers();
      let trip = null;
      for (const u of users) {
        ensureTrips(u);
        const t = (u.trips || []).find((x) => x.id === tripId);
        if (!t) continue;
        trip = t;
        break;
      }
      if (!trip) return res.status(404).json({ error: "Trip not found." });
      if (!trip.isPublic) {
        const user = req.user;
        if (!user?.id) return res.status(401).json({ error: "Authentication required." });
        const hasAccess = trip.userId === user.id || (trip.collaborators || []).some((c) => c.userId === user.id);
        if (!hasAccess) return res.status(404).json({ error: "Trip not found." });
      }
      ensureComments(trip);
      const sorted = [...trip.comments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const comments = sorted.slice(offset, offset + limit);
      const withEmails = comments.map((c) => {
        const author = users.find((u) => u.id === c.userId);
        return { ...c, authorEmail: author?.email || null };
      });
      return res.status(200).json({ comments: withEmails, total: trip.comments.length });
    } catch (error) {
      return next(error);
    }
  }
);

app.post(
  "/trips/:id/comments",
  requireAuth,
  [param("id").notEmpty().withMessage("Trip ID is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tripId = String(req.params.id || "");
      const text = String((req.body && req.body.text) || "").trim();
      const imageKey = typeof req.body?.imageKey === "string" ? req.body.imageKey.trim() : "";
      if (!text && !imageKey) return res.status(400).json({ error: "Comment text or image is required." });
      const users = await readUsers();
      let trip = null;
      let ownerUser = null;
      for (const u of users) {
        ensureTrips(u);
        const t = (u.trips || []).find((x) => x.id === tripId);
        if (!t) continue;
        trip = t;
        ownerUser = u;
        break;
      }
      if (!trip) return res.status(404).json({ error: "Trip not found." });
      if (!trip.isPublic) {
        const hasAccess = trip.userId === userId || (trip.collaborators || []).some((c) => c.userId === userId);
        if (!hasAccess) return res.status(403).json({ error: "Cannot comment on this trip." });
      }
      ensureComments(trip);
      const authUser = users.find((c) => c.id === userId);
      let sizeToAdd = 0;
      if (imageKey) {
        const prefix = `uploads/${authUser.id}/`;
        if (!imageKey.startsWith(prefix)) return res.status(400).json({ error: "Invalid image key." });
        const objectSize = await getObjectSizeR2(imageKey);
        if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: "Image not found. Upload first." });
        const profile = ensureProfile(authUser);
        const used = profile.storageUsed || 0;
        if (used + objectSize > STORAGE_LIMIT_BYTES) return res.status(413).json({ error: "Storage limit exceeded." });
        sizeToAdd = objectSize;
      }
      const newComment = {
        id: crypto.randomUUID(),
        userId,
        text: text || "",
        createdAt: new Date().toISOString(),
      };
      if (imageKey) newComment.imageKey = imageKey;
      trip.comments.push(newComment);
      if (sizeToAdd > 0) {
        const profile = ensureProfile(authUser);
        profile.storageUsed = (profile.storageUsed || 0) + sizeToAdd;
      }
      await writeUsers(users);
      return res.status(201).json({ ...newComment, authorEmail: authUser?.email || null });
    } catch (error) {
      return next(error);
    }
  }
);

// MVP3.9: Trip gallery – GET list, POST add image
app.get("/trips/:id/gallery", optionalAuth, [param("id").notEmpty().withMessage("Trip ID is required.")], handleValidationErrors, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tripId = String(req.params.id || "");
    const users = await readUsers();
    let trip = null;
    for (const u of users) {
      ensureTrips(u);
      ensureGallery(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      break;
    }
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (!trip.isPublic) {
      if (!userId) return res.status(401).json({ error: "Authentication required." });
      const hasAccess = trip.userId === userId || (trip.collaborators || []).some((c) => c.userId === userId);
      if (!hasAccess) return res.status(404).json({ error: "Trip not found." });
    }
    const withEmails = (trip.gallery || []).map((item) => {
      const commentsWithEmail = (item.comments || []).map((c) => {
        const author = users.find((u) => u.id === c.userId);
        return { ...c, authorEmail: author?.email || null };
      });
      return { ...item, comments: commentsWithEmail };
    });
    return res.status(200).json({ gallery: withEmails });
  } catch (error) {
    return next(error);
  }
});

app.post("/trips/:id/gallery", requireAuth, [param("id").notEmpty().withMessage("Trip ID is required.")], handleValidationErrors, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tripId = String(req.params.id || "");
    const imageKey = typeof req.body?.imageKey === "string" ? req.body.imageKey.trim() : "";
    if (!imageKey) return res.status(400).json({ error: "imageKey is required." });
    const users = await readUsers();
    const authUser = users.find((c) => c.id === userId);
    if (!authUser) return res.status(404).json({ error: "User not found." });
    ensureTrips(authUser);
    let trip = (authUser.trips || []).find((t) => t.id === tripId);
    let ownerUser = authUser;
    if (!trip) {
      for (const u of users) {
        ensureTrips(u);
        ensureGallery(u);
        const t = (u.trips || []).find((x) => x.id === tripId);
        if (!t) continue;
        const collab = (t.collaborators || []).find((c) => c.userId === userId);
        if (collab && collab.role === "editor") {
          trip = t;
          ownerUser = u;
          break;
        }
      }
    }
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    ensureGallery(trip);
    const collab = (trip.collaborators || []).find((c) => c.userId === userId);
    const canPost = trip.userId === userId || (collab && collab.role === "editor");
    if (!canPost) return res.status(403).json({ error: "Only trip owner or editors can add gallery images." });
    const prefix = `uploads/${authUser.id}/`;
    if (!imageKey.startsWith(prefix)) return res.status(400).json({ error: "Invalid image key." });
    const objectSize = await getObjectSizeR2(imageKey);
    if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: "Image not found. Upload first." });
    const profile = ensureProfile(authUser);
    const used = profile.storageUsed || 0;
    if (used + objectSize > STORAGE_LIMIT_BYTES) return res.status(413).json({ error: "Storage limit exceeded." });
    const item = {
      id: crypto.randomUUID(),
      imageKey,
      userId,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
    };
    trip.gallery.push(item);
    profile.storageUsed = (profile.storageUsed || 0) + objectSize;
    trip.updatedAt = new Date().toISOString();
    await writeUsers(users);
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

// MVP3.9: Gallery image like – POST/DELETE
app.post("/trips/:id/gallery/:imageId/like", requireAuth, [param("id").notEmpty(), param("imageId").notEmpty()], handleValidationErrors, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tripId = String(req.params.id || "");
    const imageId = String(req.params.imageId || "");
    const users = await readUsers();
    let trip = null;
    for (const u of users) {
      ensureTrips(u);
      ensureGallery(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      break;
    }
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    const item = (trip.gallery || []).find((i) => i.id === imageId);
    if (!item) return res.status(404).json({ error: "Gallery image not found." });
    ensureGalleryImageLikes(item);
    if (!item.likes.includes(userId)) item.likes.push(userId);
    await writeUsers(users);
    return res.status(200).json({ liked: true, likeCount: item.likes.length });
  } catch (error) {
    return next(error);
  }
});

app.delete("/trips/:id/gallery/:imageId/like", requireAuth, [param("id").notEmpty(), param("imageId").notEmpty()], handleValidationErrors, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tripId = String(req.params.id || "");
    const imageId = String(req.params.imageId || "");
    const users = await readUsers();
    let trip = null;
    for (const u of users) {
      ensureTrips(u);
      ensureGallery(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      break;
    }
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    const item = (trip.gallery || []).find((i) => i.id === imageId);
    if (!item) return res.status(404).json({ error: "Gallery image not found." });
    ensureGalleryImageLikes(item);
    const idx = item.likes.indexOf(userId);
    if (idx !== -1) item.likes.splice(idx, 1);
    await writeUsers(users);
    return res.status(200).json({ liked: false, likeCount: item.likes.length });
  } catch (error) {
    return next(error);
  }
});

// MVP3.9: Gallery image comments – GET list, POST add (with optional imageKey)
app.get("/trips/:id/gallery/:imageId/comments", optionalAuth, [param("id").notEmpty(), param("imageId").notEmpty()], handleValidationErrors, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tripId = String(req.params.id || "");
    const imageId = String(req.params.imageId || "");
    const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
    const offset = Math.max(0, Number(req.query?.offset) || 0);
    const users = await readUsers();
    let trip = null;
    for (const u of users) {
      ensureTrips(u);
      ensureGallery(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      break;
    }
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (!trip.isPublic && !userId) return res.status(401).json({ error: "Authentication required." });
    if (!trip.isPublic && userId) {
      const hasAccess = trip.userId === userId || (trip.collaborators || []).some((c) => c.userId === userId);
      if (!hasAccess) return res.status(404).json({ error: "Trip not found." });
    }
    const item = (trip.gallery || []).find((i) => i.id === imageId);
    if (!item) return res.status(404).json({ error: "Gallery image not found." });
    ensureGalleryImageComments(item);
    const sorted = [...(item.comments || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const comments = sorted.slice(offset, offset + limit);
    const withEmails = comments.map((c) => {
      const author = users.find((u) => u.id === c.userId);
      return { ...c, authorEmail: author?.email || null };
    });
    return res.status(200).json({ comments: withEmails, total: item.comments.length });
  } catch (error) {
    return next(error);
  }
});

app.post("/trips/:id/gallery/:imageId/comments", requireAuth, [param("id").notEmpty(), param("imageId").notEmpty()], handleValidationErrors, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tripId = String(req.params.id || "");
    const imageId = String(req.params.imageId || "");
    const text = String((req.body && req.body.text) || "").trim();
    const imageKey = typeof req.body?.imageKey === "string" ? req.body.imageKey.trim() : "";
    if (!text && !imageKey) return res.status(400).json({ error: "Comment text or image is required." });
    const users = await readUsers();
    const authUser = users.find((c) => c.id === userId);
    if (!authUser) return res.status(404).json({ error: "User not found." });
    let trip = null;
    for (const u of users) {
      ensureTrips(u);
      ensureGallery(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      break;
    }
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    const item = (trip.gallery || []).find((i) => i.id === imageId);
    if (!item) return res.status(404).json({ error: "Gallery image not found." });
    ensureGalleryImageComments(item);
    let sizeToAdd = 0;
    if (imageKey) {
      const prefix = `uploads/${authUser.id}/`;
      if (!imageKey.startsWith(prefix)) return res.status(400).json({ error: "Invalid image key." });
      const objectSize = await getObjectSizeR2(imageKey);
      if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: "Image not found. Upload first." });
      const profile = ensureProfile(authUser);
      const used = profile.storageUsed || 0;
      if (used + objectSize > STORAGE_LIMIT_BYTES) return res.status(413).json({ error: "Storage limit exceeded." });
      sizeToAdd = objectSize;
    }
    const newComment = { id: crypto.randomUUID(), userId, text: text || "", createdAt: new Date().toISOString() };
    if (imageKey) newComment.imageKey = imageKey;
    item.comments.push(newComment);
    if (sizeToAdd > 0) {
      const profile = ensureProfile(authUser);
      profile.storageUsed = (profile.storageUsed || 0) + sizeToAdd;
    }
    trip.updatedAt = new Date().toISOString();
    await writeUsers(users);
    return res.status(201).json({ ...newComment, authorEmail: authUser.email });
  } catch (error) {
    return next(error);
  }
});

app.post(
  "/invite/redeem",
  requireAuth,
  [body("code").trim().notEmpty().withMessage("Code is required.")],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email || "";
      const code = String(req.body?.code || "").trim().toUpperCase();
      const users = await readUsers();
      const authUser = users.find((c) => c.id === userId);
      if (!authUser) return res.status(404).json({ error: "User not found." });
      for (const u of users) {
        ensureTrips(u);
        for (const trip of u.trips || []) {
          ensureInvites(trip);
          ensureCollaborators(trip);
          const idx = trip.invites.findIndex(
            (i) => i.code === code && new Date(i.expiresAt) > new Date()
          );
          if (idx === -1) continue;
          if (trip.userId === userId) {
            return res.status(400).json({ error: "You already own this trip." });
          }
          if (trip.collaborators.some((c) => c.userId === userId)) {
            return res.status(400).json({ error: "You are already a collaborator." });
          }
          const role = trip.invites[idx].role;
          trip.invites.splice(idx, 1);
          trip.collaborators.push({ userId, email: userEmail, role });
          trip.updatedAt = new Date().toISOString();
          await writeUsers(users);
          return res.status(200).json({ trip: { ...trip, ownerEmail: u.email }, role });
        }
      }
      return res.status(400).json({ error: "Invalid or expired invite code." });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /profile/{id}:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile
 *     description: Retrieves the profile information for a specific user. Authentication is optional but recommended.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               email: "user@example.com"
 *               phone: "+1 555 000 0000"
 *               country: "United States"
 *               language: "en"
 *               currencyType: "USD"
 *               createdAt: "2026-01-30T10:30:00.000Z"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get(
  "/profile/:id",
  optionalAuth,
  [
    param("id")
      .notEmpty()
      .withMessage("User ID is required."),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = String(req.params.id || "");
      const users = await readUsers();
      const user = users.find((candidate) => candidate.id === userId);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.status(200).json(buildProfileResponse(user));
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /profile/{id}:
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     description: Updates profile information for a specific user. All fields are optional except the user ID in the path. Authentication is optional but recommended.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email address (must be unique if changed)
 *                 example: "newemail@example.com"
 *               phone:
 *                 type: string
 *                 description: Phone number
 *                 example: "+1 555 000 0000"
 *               country:
 *                 type: string
 *                 description: Country name
 *                 example: "United States"
 *               language:
 *                 type: string
 *                 enum: ["en", "hi", "ml", "ar", "es", "de"]
 *                 description: Preferred language code
 *                 example: "en"
 *               currencyType:
 *                 type: string
 *                 enum: ["USD", "EUR", "INR", "AED", "GBP", "CAD", "AUD"]
 *                 description: Preferred currency
 *                 example: "USD"
 *           example:
 *             email: "user@example.com"
 *             phone: "+1 555 000 0000"
 *             country: "United States"
 *             language: "en"
 *             currencyType: "USD"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidEmail:
 *                 value:
 *                   error: "Please provide a valid email address."
 *               invalidLanguage:
 *                 value:
 *                   error: "Language must be one of: en, hi, ml, ar, es, de"
 *               invalidCurrency:
 *                 value:
 *                   error: "Currency must be one of: USD, EUR, INR, AED, GBP, CAD, AUD"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found."
 *       409:
 *         description: Email already registered to another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email is already registered."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put(
  "/profile/:id",
  optionalAuth,
  [
    param("id")
      .notEmpty()
      .withMessage("User ID is required."),
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),
    body("language")
      .optional()
      .isIn(["en", "hi", "ml", "ar", "es", "de"])
      .withMessage("Language must be one of: en, hi, ml, ar, es, de"),
    body("currencyType")
      .optional()
      .isIn(["USD", "EUR", "INR", "AED", "GBP", "CAD", "AUD"])
      .withMessage("Currency must be one of: USD, EUR, INR, AED, GBP, CAD, AUD"),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = String(req.params.id || "");
      const users = await readUsers();
      const user = users.find((candidate) => candidate.id === userId);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (req.body && Object.prototype.hasOwnProperty.call(req.body, "email")) {
        const normalizedEmail = normalizeEmail(req.body.email);
        if (!normalizedEmail) {
          return res.status(400).json({ error: "Email must be provided." });
        }

        const existing = users.find(
          (candidate) =>
            candidate.email === normalizedEmail && candidate.id !== userId
        );
        if (existing) {
          return res.status(409).json({ error: "Email is already registered." });
        }
        user.email = normalizedEmail;
      }

      const profile = ensureProfile(user);
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, "phone")) {
        profile.phone = String(req.body.phone ?? "");
      }
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, "country")) {
        profile.country = String(req.body.country ?? "");
      }
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, "language")) {
        profile.language = String(req.body.language ?? "");
      }
      if (
        req.body &&
        Object.prototype.hasOwnProperty.call(req.body, "currencyType")
      ) {
        profile.currencyType = String(req.body.currencyType ?? "");
      }
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, "interests")) {
        profile.interests = ensureProfileArray(req.body.interests);
      }
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, "preferredDestinations")) {
        profile.preferredDestinations = ensureProfileArray(req.body.preferredDestinations);
      }

      await writeUsers(users);
      return res.status(200).json(buildProfileResponse(user));
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: API root endpoint
 *     description: Welcome message with links to API documentation
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 documentation:
 *                   type: string
 */
app.get("/", (req, res) => {
  res.json({
    message: "TripMaker Authentication API",
    version: "2.0.0",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    error: status === 500 ? "Internal server error." : err.message,
  });
});

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  // Use file storage first so readUsers/writeUsers are always set
  readUsers = readUsersFile;
  writeUsers = writeUsersFile;
  await seedDevUser();

  // Listen immediately so Render detects an open port (avoids "No open ports" deploy failure)
  app.listen(PORT, () => {
    console.log(`🚀 Auth server listening on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    if (!process.env.MONGODB_URI) {
      console.log("📁 Storage: file-based (set MONGODB_URI to use MongoDB)");
    } else {
      // Connect to MongoDB in background so TLS/network issues don't block startup
      connectMongoInBackground();
    }
  });
}

function connectMongoInBackground() {
  const dbModule = require("./lib/db");
  const retryIntervalMs = 30000; // 30s

  function tryConnect() {
    dbModule.connect()
      .then(() => {
        readUsers = dbModule.readUsers.bind(dbModule);
        writeUsers = dbModule.writeUsers.bind(dbModule);
        return seedDevUser();
      })
      .then(() => {
        console.log("✅ Switched to MongoDB storage");
      })
      .catch((err) => {
        console.warn("MongoDB connect failed (will retry in 30s):", err.message);
        setTimeout(tryConnect, retryIntervalMs);
      });
  }

  tryConnect();
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

module.exports = app;
