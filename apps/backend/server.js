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
  if (process.env.NODE_ENV === "production") {
    console.error("❌ CRITICAL: JWT_SECRET is required in production!");
    process.exit(1);
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

async function readUsers() {
  await writeQueue;
  await ensureUsersFile();
  const raw = await fs.readFile(getUsersFilePath(), "utf8");
  if (!raw.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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

app.listen(PORT, () => {
  console.log(`🚀 Auth server listening on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
