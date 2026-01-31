require("dotenv").config();
const express = require("express");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { body, param, validationResult } = require("express-validator");

const app = express();

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_USER_DB_PATH = path.resolve("data/users.json");
const TMP_USER_DB_PATH = path.join(os.tmpdir(), "tripmaker-users.json");
let usersFilePath = path.resolve(
  process.env.USER_DB_PATH ||
    (process.env.VERCEL ? TMP_USER_DB_PATH : DEFAULT_USER_DB_PATH)
);

// Auto-generate JWT secret for development if not provided
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const error = "❌ CRITICAL: JWT_SECRET is required in production!";
    console.error(error);
    // In serverless, throw error instead of exit to allow graceful error handling
    throw new Error(error);
  }
  // Generate a random secret for development
  const devSecret = crypto.randomBytes(32).toString("hex");
  console.log("⚠️  Development mode: Using auto-generated JWT secret");
  console.log("💡 For production, set JWT_SECRET in environment variables");
  return devSecret;
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
};

let writeQueue = Promise.resolve();

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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

const registerLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many registration attempts, please try again later."
);

const loginLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts, please try again later."
);

const generalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests, please try again later."
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
  try {
    await ensureUsersFile();
    const raw = await fs.readFile(getUsersFilePath(), "utf8");
    const users = raw.trim() ? JSON.parse(raw) : [];
    
    // Check if dev user exists
    const existingUser = users.find(u => u.id === DEV_USER.id);
    if (existingUser) {
      return; // Already exists
    }
    
    // Create dev user
    const devUser = {
      id: DEV_USER.id,
      email: DEV_USER.email,
      passwordHash: hashPassword(DEV_USER.password),
      trips: [],
      profile: { ...DEV_USER.profile },
      createdAt: new Date().toISOString(),
      isTestUser: true
    };
    
    users.push(devUser);
    await fs.writeFile(getUsersFilePath(), JSON.stringify(users, null, 2));
    console.log('✅ Development test user seeded:', DEV_USER.email);
  } catch (error) {
    console.error('Failed to seed dev user:', error);
  }
}

async function readUsers() {
  await writeQueue;
  await seedDevUser(); // Auto-seed dev user
  await ensureUsersFile();
  const raw = await fs.readFile(getUsersFilePath(), "utf8");
  if (!raw.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    const users = Array.isArray(parsed) ? parsed : [];
    let needsWrite = false;

    users.forEach((user) => {
      const hadTrips = Array.isArray(user.trips);
      ensureTrips(user);
      if (!hadTrips) {
        needsWrite = true;
      }
    });

    if (needsWrite) {
      await writeUsers(users);
    }

    return users;
  } catch (error) {
    error.message = `Invalid users data file: ${error.message}`;
    throw error;
  }
}

async function writeUsers(users) {
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
  return user.profile;
}

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
 */
function ensureTrips(user) {
  if (!Array.isArray(user.trips)) {
    user.trips = [];
  }
  return user.trips;
}

function buildProfileResponse(user) {
  const profile = ensureProfile(user);
  return {
    id: user.id,
    email: user.email,
    phone: profile.phone,
    country: profile.country,
    language: profile.language,
    currencyType: profile.currencyType,
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
];

const CITY_ALIASES = {
  paris: "paris",
  "paris france": "paris",
  tokyo: "tokyo",
  "tokyo japan": "tokyo",
  "new york": "new-york",
  "new york city": "new-york",
  nyc: "new-york",
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

// Only start server if not running in Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Auth server listening on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel serverless function
module.exports = app;
