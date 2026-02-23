# 🏗️ TripMaker Application Architecture

**Last Updated:** February 2026 (MongoDB migration; frontend UI standards: touchable, page header, spacing)  
**Version:** 1.0.0  
**Status:** Production-Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Security Architecture](#security-architecture)
9. [Internationalization](#internationalization)
10. [Development Workflow](#development-workflow)

---

## Overview

**TripMaker** (branded as "Waypoint") is a modern, production-ready trip planning and organization platform. It's built as a monorepo using npm workspaces, with a React frontend and Express.js backend, deployed as a full-stack application on Vercel.

### Key Features
- User authentication (registration, login, JWT-based sessions)
- User profile management (multi-language, multi-currency)
- Internationalization (6 languages: English, Hindi, Malayalam, Arabic, Spanish, German)
- Auto-seeded development user for consistent testing
- RESTful API with OpenAPI/Swagger documentation
- Rate limiting and security hardening
- Responsive UI with modern design

### Production URLs
- **Frontend**: https://trip-maker-pink.vercel.app
- **Backend API**: https://trip-maker-pink.vercel.app/api
- **API Docs**: http://localhost:3000/api-docs (local); production: your Render backend URL + /api-docs

---

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                         RENDER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend (Static Site) – apps/frontend/dist/         │  │
│  │  React + Vite + React Router + i18next                │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│                     │ API Calls (to Backend URL)             │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Backend (Web Service) – apps/backend/server.js        │  │
│  │  Express.js API                                       │  │
│  │  Routes: /health, /api/*, /api-docs, etc.               │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│                     │ MongoDB (when MONGODB_URI set)        │
│                     │ or File I/O (ephemeral fallback)       │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB Atlas: users + trips collections; or         │  │
│  │  /tmp/tripmaker-users.json (fallback)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT

┌────────────────┐                    ┌────────────────┐
│   Frontend     │                    │    Backend     │
│  localhost:    │  ─────────────►   │  localhost:    │
│     5173       │   API Calls        │     3000       │
│  (Vite Dev     │                    │  (Express.js)  │
│   Server)      │                    │                │
└────────────────┘                    └────────┬───────┘
                                               │
                          MONGODB_URI set?    │
                          ├─ Yes: MongoDB     │
                          └─ No:  File I/O    ▼
                                      ┌────────────────┐
                                      │  MongoDB Atlas  │
                                      │  or data/users  │
                                      │     .json       │
                                      └────────────────┘
```

---

## Technology Stack

### Frontend (Web)
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.3 | UI framework (functional components, hooks) |
| **Vite** | 7.3.1 | Build tool and dev server (fast HMR) |
| **React Router DOM** | 7.12.0 | Client-side routing |
| **i18next** | 25.8.0 | Internationalization framework |
| **react-i18next** | 16.5.3 | React bindings for i18n |
| **Leaflet** | (see package.json) | Map rendering (OSM tiles) |
| **react-leaflet** | (see package.json) | React bindings for Leaflet |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 5.2.1 | Web framework |
| **jsonwebtoken** | 9.0.2 | JWT authentication |
| **Helmet** | 7.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **express-validator** | 7.0.1 | Request validation |
| **express-rate-limit** | 7.1.5 | Rate limiting |
| **morgan** | 1.10.0 | HTTP request logging |
| **swagger-ui-express** | 5.0.0 | API documentation UI |
| **swagger-jsdoc** | 6.2.8 | OpenAPI spec generation |
| **dotenv** | 16.3.1 | Environment variables |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Render** | Hosting (Static Site + Web Service); no Vercel |
| **MongoDB Atlas** | Database when `MONGODB_URI` is set (free M0 tier); see MONGODB_SETUP.md |
| **npm workspaces** | Monorepo management |
| **Git/GitHub** | Version control |

---

## Database (MongoDB)

When `MONGODB_URI` is set (local `.env` or Render environment), the backend uses MongoDB instead of file-based storage.

- **Collections:** `users` (id, email, passwordHash, profile, createdAt; no trips array); `trips` (full trip document with `userId` as owner). Same logical model as before; trips are stored in a separate collection for scalability.
- **Connection:** One client shared across requests; connect at startup before accepting traffic.
- **Fallback:** If `MONGODB_URI` is not set, the backend uses file-based JSON (`data/users.json` locally; ephemeral path on Render). See [MONGODB_SETUP.md](MONGODB_SETUP.md) for setup steps.

---

## Data Flow

### 1. User Registration Flow

```
User → Frontend → Backend → Storage
  │         │         │         │
  │         │         │         │
  1. Enter email     │         │
     & password      │         │
  │                  │         │
  2. ──────────────► │         │
     POST /register  │         │
  │                  │         │
  │                  3. Validate input
  │                  │  Hash password
  │                  │  Generate ID
  │                  │         │
  │                  4. ──────►│
  │                  │  Save user
  │                  │         │
  │                  5. ◄──────┘
  │                  │  Success
  │                  │         │
  6. ◄──────────────┘         │
     Return user ID           │
  │                            │
  7. Navigate to login        │
```

### 2. User Login Flow

```
User → Frontend → Backend → Storage → Frontend
  │         │         │         │         │
  │         │         │         │         │
  1. Enter email     │         │         │
     & password      │         │         │
  │                  │         │         │
  2. ──────────────► │         │         │
     POST /login     │         │         │
  │                  │         │         │
  │                  3. ◄──────┘         │
  │                  │  Find user        │
  │                  │  Verify password  │
  │                  │                   │
  │                  4. Generate JWT     │
  │                  │  (7-day expiry)   │
  │                  │                   │
  5. ◄──────────────┘                   │
     Return token                        │
  │  & user data                         │
  │                                      │
  6. ────────────────────────────────►  │
     Store token + user in localStorage  │
  │                                      │
  7. Navigate to /home                   │
```

### 3. Authenticated API Call Flow

```
Frontend → Backend → Storage → Backend → Frontend
    │          │         │         │         │
    │          │         │         │         │
    1. User action      │         │         │
       (e.g., get       │         │         │
        profile)        │         │         │
    │                   │         │         │
    2. ───────────────► │         │         │
       GET /profile/:id │         │         │
       Authorization:   │         │         │
       Bearer <token>   │         │         │
    │                   │         │         │
    │                   3. Verify JWT      │
    │                   │  Extract user ID │
    │                   │                  │
    │                   4. ◄──────┘        │
    │                   │  Read user data  │
    │                   │                  │
    │                   5. Build response  │
    │                   │                  │
    6. ◄───────────────┘                  │
       Profile data                        │
    │                                      │
    7. Update UI                           │
```

---

## Frontend Architecture

### Directory Structure

```
apps/frontend/
├── src/
│   ├── pages/              # Page components (routes)
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── Trips.jsx
│   │   ├── TripDetail.jsx
│   │   ├── TripGallery.jsx # Trip gallery carousel, likes/comments per image (MVP3)
│   │   └── Feed.jsx
│   ├── components/         # Reusable UI components
│   │   └── MapView.jsx     # Leaflet map with destination + itinerary markers
│   ├── layouts/            # Layout wrappers
│   │   ├── AuthLayout.jsx  # For login/register pages
│   │   └── SiteLayout.jsx  # For authenticated pages
│   ├── services/           # API communication layer
│   │   ├── auth.js         # Auth API calls
│   │   ├── profile.js      # Profile API calls
│   │   ├── geocode.js      # Nominatim geocoding, place cache
│   │   ├── tripPlanner.js  # POST /trips/plan
│   │   └── trips.js        # createTrip, fetchTrips, fetchTrip (POST/GET /trips)
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   ├── i18n.js             # i18n configuration (6 languages)
│   ├── index.css           # Global styles (imports variables.css)
│   └── styles/
│       └── variables.css   # Design tokens (colors, spacing, radius, typography)
├── index.html              # HTML template (Plus Jakarta Sans font)
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

### Component Architecture

```
App (Router)
│
├─ AuthLayout
│  ├─ Login
│  └─ Register
│
└─ SiteLayout
   ├─ Navigation (desktop: top bar; mobile: bottom tab bar with icons)
   ├─ Language Switcher
   ├─ Home (RequireAuth)
   │  └─ MapView (Leaflet: destination marker + itinerary markers, popups)
   ├─ Trips (RequireAuth) – list saved trips, Create New Trip → Home
   ├─ Feed (RequireAuth) – discover / public trips; trip cards show thumbnail + gallery preview; comments support image attach (MVP3)
   ├─ TripDetail (RequireAuth) – view single trip; cover/gallery row; trip comments with image attach; link to TripGallery
   ├─ TripGallery (RequireAuth) – /trips/:id/gallery; minimal header (round back + trip name + add icon); empty state; carousel, thumb strip, like/comment per image (MVP3)
   └─ Profile (RequireAuth)
```

### UI Standards & Responsive Layout

**Design system:** `src/styles/variables.css` defines design tokens (colors, spacing, radius, shadows, typography). Global styles in `index.css` use these tokens for consistency.

**Touchable feedback:** The `.touchable` utility provides consistent hover/active opacity (TouchableOpacity-style) for clickable cards and links. Used on trip cards, feed cards, and any element that should show tap/click feedback without a separate button.

**Standard page header (app-wide):** Every main page uses a single-row header: round back button or `.page-header-spacer` (left) + page title (centre, truncate) + primary CTA or empty `.page-header-actions` (right). CSS: `.page-header`, `.page-header-back`, `.page-header-title`, `.page-header-title-wrap` (when title + badge), `.page-header-actions`, `.page-header-action-round`. All header icon actions use `.page-header-action-round` for consistent border and size. Used on Trip Detail, Trips, Feed, Profile, Trip Gallery. Top padding below the app navbar is consistent: `var(--space-4)` on all pages; Trip Detail desktop adds `padding-top` on main and `.trip-detail-main` so the gap matches.

**Breakpoints:**
- **Desktop (≥768px):** Top header with logo, horizontal nav links (Home, Trips, Feed, Profile), language selector, and logout. Content area full width up to `--container-max` (1120px).
- **Mobile (<768px):** Top header (logo + language + logout only). **Bottom tab bar** with 4 equal columns: icon + label per item (Home, Trips, Feed, Profile). Content has bottom padding for safe area and tab bar height.

**Typography:** Plus Jakarta Sans (Google Fonts). Font sizes and weights use CSS variables (`--text-sm`, `--font-semibold`, etc.).

**Navigation:** Mobile uses inline SVG icons (no icon library). Tab bar is fixed to bottom with `env(safe-area-inset-bottom)` for notched devices. Active state uses primary color and slight icon scale.

**AI-ready look:** Subtle gradients on auth shell and hero sections; consistent card shadows and radii; primary/accent palette (teal/blue) applied to buttons and active states.

### Map Preview (MVP1)

- **MapView** (Leaflet + OpenStreetMap tiles): destination marker (red), itinerary place markers (blue), popups with name/category.
- **Geocoding**: `getDestinationCoordinates(destination)` and `geocodePlace(placeName, destination)` via Nominatim; in-memory cache for places; rate-limited (~1.2s between place requests) for policy compliance.
- **Home flow**: After plan is generated, map loads destination; itinerary markers are geocoded in background and added as they resolve. "Open in map" link opens OSM in a new tab.

### State Management

**Local Storage:**
- `waypoint.user`: User object (id, email, token)
- `waypoint.profile`: Profile data (phone, country, language, currency)
- `waypoint.language`: Current UI language

**React State:**
- Component-level state using `useState`
- Auth state synced via custom `authchange` event
- No global state management library (intentionally simple)

### API Service Layer

```javascript
// apps/frontend/src/services/auth.js
- registerUser(payload)     → POST /api/auth/register
- loginUser(payload)         → POST /api/auth/login
- requestJson(path, options) → Generic fetch wrapper
- getStoredUser()            → Read from localStorage
- setStoredUser(user)        → Write to localStorage
- clearStoredUser()          → Remove from localStorage

// apps/frontend/src/services/profile.js
- fetchProfile(userId)       → GET /api/profile/{id}
- updateProfile(userId, data) → PUT /api/profile/{id}
- getStoredProfile()         → Read from localStorage
- saveProfile(profile)       → Write to localStorage
- clearStoredProfile()       → Remove from localStorage
```

### Routing Strategy

```javascript
// Public routes (AuthLayout)
/              → Login
/login         → Login
/register      → Register

// Protected routes (SiteLayout + RequireAuth)
/home          → Home (requires authentication)
/profile       → Profile (requires authentication)

// Fallback
/*             → Redirect to /
```

---

## Backend Architecture

### Architecture Pattern

**Monolithic Express.js** (local development)
- All routes in single `server.js` file
- In-memory queue for write operations
- File-based user storage (`data/users.json`)

**Serverless Functions** (Vercel production)
- **Single entry point:** `api/index.js` (Vercel Hobby plan allows max 12 functions; one router keeps us under the limit)
- All `/api/*` requests are rewritten to `api/index.js`; routing is done by path and method inside that file
- Handler logic lives in `api/lib/handlers/` (health, auth, userProfile, trips, invite); these are required modules, not separate serverless functions
- Shared utilities in `api/lib/` (db, auth, seedUser, tripPlanner)
- Ephemeral storage (`/tmp/tripmaker-users.json`), auto-seeding on every invocation

### API Structure

```
Local Development (apps/backend/server.js)
├─ Configuration
├─ Swagger Documentation
├─ Middleware Setup
│  ├─ Helmet (security headers)
│  ├─ CORS
│  ├─ Rate Limiting
│  ├─ Morgan (logging)
│  └─ JSON parsing
├─ Utility Functions
│  ├─ Password hashing (scrypt)
│  ├─ JWT generation
│  ├─ User storage (read/write)
│  └─ Dev user seeding
├─ Auth Middleware
│  ├─ requireAuth
│  └─ optionalAuth
├─ API Endpoints
│  ├─ GET  /                 (API root)
│  ├─ GET  /health           (Health check)
│  ├─ POST /register         (Create user)
│  ├─ POST /login            (Authenticate)
│  ├─ POST /trips/plan       (Generate trip plan – static)
│  ├─ POST /trips/agent/chat (MVP4: AI trip agent – chat to get/refine plan; fallback to static)
│  ├─ POST /trips            (Create trip)
│  ├─ GET  /trips            (List trips)
│  ├─ GET  /trips/:id        (Get/update/delete trip)
│  ├─ PATCH /trips/:id/archive   (Archive trip)
│  ├─ PATCH /trips/:id/unarchive (Unarchive trip)
│  ├─ GET  /profile/:id      (Get profile)
│  └─ PUT  /profile/:id      (Update profile)
├─ Trip Agent (MVP4)
│  └─ lib/tripAgent.js       (Adapter interface; Gemini implementation; env TRIP_AGENT_PROVIDER, TRIP_AGENT_API_KEY or GEMINI_API_KEY; fallback to static planner)
├─ Error Handlers
│  ├─ 404 handler
│  └─ Global error handler
└─ Server Start

Vercel Production (api/)
├─ index.js                 (API root)
├─ health.js                (Health check)
├─ auth/
│  ├─ register.js          (User registration)
│  └─ login.js             (User login)
├─ user/
│  └─ profile.js           (Profile GET/PUT)
└─ lib/
   ├─ db.js                (Database utilities)
   └─ seedUser.js          (Auto-seed dev user)
```

### Authentication Flow

```
1. User Registration:
   - Validate email & password
   - Check if email exists
   - Hash password (scrypt + random salt)
   - Generate unique user ID (crypto.randomUUID)
   - Create user object with profile defaults
   - Save to storage
   - Return user ID (no auto-login)

2. User Login:
   - Validate email & password
   - Find user by email
   - Verify password hash
   - Generate JWT token (7-day expiry)
   - Return token + user data

3. JWT Token:
   - Payload: { id, email }
   - Algorithm: HS256
   - Expiry: 7 days (configurable)
   - Verified on protected routes

4. Protected Routes:
   - Extract token from Authorization header
   - Verify JWT signature
   - Decode user info
   - Attach req.user for route handlers
```

### Data Models

```typescript
// Trip Model
interface Trip {
  id: string;                   // UUID
  userId: string;               // Owner user ID
  name: string;                 // Trip name
  destination: string;          // Destination name
  days: number;                 // 1-10
  pace: 'relaxed' | 'balanced' | 'fast';
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  itinerary: Array<Record<string, unknown>>;
  prerequisites?: PrerequisiteItem[];  // Additional feature: trip checklist (add/assign/done)
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
}

// Prerequisite item (between MVP3 and MVP4)
interface PrerequisiteItem {
  id: string;                   // UUID
  title: string;
  description?: string;
  category?: string;             // documents | clothing | electronics | medicine | other
  imageKey?: string;            // R2 key (optional)
  assigneeUserId?: string;
  assigneeEmail?: string;
  status: 'pending' | 'done';
  createdAt: string;
  createdBy?: string;
}

// User Model
interface User {
  id: string;                    // UUID
  email: string;                 // Normalized, unique
  passwordHash: string;          // salt:hash format
  trips: Trip[];                 // Saved trips
  profile: {
    phone: string;               // Optional
    country: string;             // Optional
    language: string;            // en, hi, ml, ar, es, de
    currencyType: string;        // USD, EUR, INR, AED, GBP, CAD, AUD
  };
  createdAt: string;             // ISO 8601 timestamp
}

// Dev User (Auto-seeded)
const DEV_USER = {
  id: 'dev-user-00000000-0000-0000-0000-000000000001',
  email: 'dev@tripmaker.com',
  password: 'DevUser123!',       // Plain text (only for reference)
  trips: [],
  profile: {
    phone: '+1 555 123 4567',
    country: 'United States',
    language: 'en',
    currencyType: 'USD'
  }
};
```

### Security Implementation

**Password Security:**
- Algorithm: scrypt (Node.js built-in)
- Salt: 16 random bytes
- Key length: 64 bytes
- Format: `salt:hash` (hex encoded)
- Timing-safe comparison

**JWT Security:**
- Secret: 64-character random string (production)
- Auto-generated in development
- Expiry: 7 days
- Signed with HS256

**Rate Limiting:**
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/register` | 5 req | 15 min |
| `/login` | 10 req | 15 min |
| Other | 100 req | 15 min |

**HTTP Security:**
- Helmet middleware (security headers)
- CORS with whitelist
- Content-Type validation
- Express 5.x (latest security patches)

---

## Deployment Architecture

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "cd apps/frontend && npm run build",
  "outputDirectory": "apps/frontend/dist",
  "rewrites": [
    {
      "source": "/profile/:id",
      "destination": "/api/user/profile?id=:id"
    },
    {
      "source": "/api/:path*",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Routing Strategy

```
Request Flow:

1. /profile/123
   → Rewrite to /api/user/profile?id=123
   → Serverless function: api/user/profile.js

2. /api/health
   → Rewrite to /api/index
   → Serverless function: api/health.js

3. /api/auth/login
   → Rewrite to /api/index
   → Serverless function: api/auth/login.js

4. /login (or any non-API path)
   → Rewrite to /index.html
   → Static file from apps/frontend/dist/
   → React Router handles client-side routing
```

### Build Process

```
1. Vercel detects push to main
   │
2. Install dependencies
   ├─ npm install (root)
   ├─ npm install --workspace=apps/frontend
   └─ npm install --workspace=apps/backend
   │
3. Build frontend
   ├─ cd apps/frontend
   ├─ npm run build (Vite)
   └─ Output: dist/
   │
4. Deploy serverless functions
   ├─ Bundle api/ directory
   ├─ Create function per file
   └─ Configure routing
   │
5. Deploy static files
   ├─ Upload apps/frontend/dist/
   └─ Configure CDN caching
   │
6. Assign URLs
   ├─ Production: https://trip-maker-pink.vercel.app
   └─ Preview: https://trip-maker-<hash>.vercel.app
```

### Environment Variables

**Required in Vercel:**
```bash
JWT_SECRET=<64-char-hex-string>
NODE_ENV=production
VITE_API_URL=/api
CORS_ORIGINS=https://trip-maker-pink.vercel.app
```

**Local Development:**
```bash
# apps/frontend/.env.development
VITE_API_URL=http://localhost:3000

# apps/backend/.env.development
PORT=3000
JWT_SECRET=<auto-generated>
CORS_ORIGINS=http://localhost:5173
```

---

## Security Architecture

### Attack Surface

```
┌─────────────────────────────────────────┐
│            External Threats             │
└─────────────┬───────────────────────────┘
              │
         ┌────▼────┐
         │ Firewall│  Vercel Edge Network
         └────┬────┘
              │
    ┌─────────▼──────────┐
    │   Rate Limiting    │  100 req/15min
    └─────────┬──────────┘
              │
    ┌─────────▼──────────┐
    │  CORS Validation   │  Whitelist origins
    └─────────┬──────────┘
              │
    ┌─────────▼──────────┐
    │  Input Validation  │  express-validator
    └─────────┬──────────┘
              │
    ┌─────────▼──────────┐
    │  Authentication    │  JWT verification
    └─────────┬──────────┘
              │
    ┌─────────▼──────────┐
    │  Authorization     │  User-specific data
    └─────────┬──────────┘
              │
    ┌─────────▼──────────┐
    │  Business Logic    │  Application code
    └────────────────────┘
```

### Security Checklist

- ✅ HTTPS only (enforced by Vercel)
- ✅ Security headers (Helmet middleware)
- ✅ CORS whitelist
- ✅ Rate limiting per endpoint
- ✅ Input validation (express-validator)
- ✅ Password hashing (scrypt)
- ✅ JWT with expiry
- ✅ Timing-safe password comparison
- ✅ No secrets in code
- ✅ Environment-based configuration
- ✅ Error messages don't leak sensitive data
- ⚠️ Ephemeral storage (Vercel serverless limitation)
- ⚠️ No persistent database (future enhancement)

---

## Internationalization

### Supported Languages

| Code | Language | Direction | Completeness |
|------|----------|-----------|--------------|
| `en` | English | LTR | 100% (default) |
| `hi` | Hindi | LTR | 100% |
| `ml` | Malayalam | LTR | 100% |
| `ar` | Arabic | RTL | 100% |
| `es` | Spanish | LTR | 100% |
| `de` | German | LTR | 100% |

### Implementation

```javascript
// apps/frontend/src/i18n.js

// 1. Define translations
const resources = {
  en: { translation: { ... } },
  hi: { translation: { ... } },
  // ... other languages
};

// 2. Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: getStoredLanguage(),  // From localStorage
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false       // React already escapes
  }
});

// 3. Update HTML attributes
document.documentElement.lang = i18n.language;
document.documentElement.dir = i18n.dir(i18n.language);

// 4. Persist language choice
i18n.on('languageChanged', (lng) => {
  window.localStorage.setItem('waypoint.language', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
});
```

### Usage in Components

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('hi')}>
        हिंदी
      </button>
    </div>
  );
};
```

### Translation Keys Structure

```
appName
nav.home, nav.profile
actions.login, actions.logout
labels.language, labels.loading
home.title, home.subtitle
auth.login.title, auth.login.button
profile.form.email, profile.form.phone
languages.en, languages.hi, ...
```

---

## Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/avinash6982/TripMakerWeb.git
cd TripMakerWeb

# 2. Install dependencies
npm install

# 3. Start development servers
npm run dev

# Result:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - API Docs: http://localhost:3000/api-docs
```

### Development Commands

```bash
# Run both frontend and backend
npm run dev

# Run individually
npm run dev:frontend
npm run dev:backend

# Build for production
npm run build

# Test backend API
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@tripmaker.com","password":"DevUser123!"}'
```

### Testing Strategy

**Manual Testing:**
1. Start local servers
2. Test API endpoints via Swagger UI or curl
3. Test frontend flows in browser
4. Verify i18n by switching languages
5. Check console for errors

**Test User:**
- Always use `dev@tripmaker.com` / `DevUser123!`
- Auto-seeded on every API call
- Consistent ID for predictable testing

**Deployment Testing:**
1. Push to main → triggers Vercel deployment
2. Wait for build completion
3. Test deployed URLs
4. Verify environment variables
5. Check Vercel function logs

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feat/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feat/new-feature

# 4. After review, merge to main
# → Automatic Vercel deployment
```

---

## Performance Considerations

### Frontend Performance
- **Vite HMR**: Instant hot module replacement in dev
- **Code Splitting**: React Router lazy loading (future)
- **Bundle Size**: ~500KB (including i18n)
- **CDN Caching**: Static assets cached by Vercel CDN

### Backend Performance
- **Cold Start**: ~500ms for serverless functions
- **Response Time**: <100ms for simple queries
- **Rate Limiting**: Prevents abuse
- **No Database**: File I/O is fast but not scalable

### Known Limitations
1. **Ephemeral Storage**: Data doesn't persist across function invocations
   - Impact: Users must re-register after deployment
   - Solution: Implement persistent database (Vercel KV/Postgres)

2. **No Real-time**: No WebSocket support
   - Impact: No live updates for group features
   - Solution: Implement WebSocket or polling

3. **Monolithic Backend**: Single large server.js file
   - Impact: Hard to maintain, test
   - Solution: Split into modular services

---

## Future Enhancements

### Short-term
- [ ] Persistent database (Vercel Postgres or KV)
- [ ] Email verification on registration
- [ ] Password reset flow
- [ ] User profile avatars
- [ ] Enhanced error messages

### Medium-term
- [ ] Trip creation and management
- [ ] Invite system for group trips
- [ ] Budget tracking
- [ ] Itinerary builder
- [ ] Real-time collaboration

### Long-term
- [ ] Native mobile app (future)
- [ ] Vendor marketplace integration
- [ ] Payment processing
- [ ] Analytics dashboard
- [ ] AI-powered trip recommendations

---

## Troubleshooting Guide

### Frontend Issues

**Issue: "Failed to fetch"**
- Check: Is backend running? (`http://localhost:3000/health`)
- Check: CORS headers in backend
- Check: `VITE_API_URL` environment variable

**Issue: "Module not found"**
- Run: `npm install --workspace=apps/frontend`
- Check: Import paths are correct
- Check: Vite is running

**Issue: "i18n keys not found"**
- Check: Key exists in `apps/frontend/src/i18n.js`
- Check: Correct namespace (default: 'translation')
- Verify: No typos in translation key

### Backend Issues

**Issue: "JWT_SECRET required"**
- Development: Auto-generated (ignore warning)
- Production: Set in Vercel environment variables

**Issue: "User not found" after deployment**
- Cause: Ephemeral storage, user data lost
- Solution: Use dev@tripmaker.com (auto-seeded)

**Issue: Rate limit exceeded**
- Wait 15 minutes
- Or restart local server to reset

### Deployment Issues

**Issue: Build fails on Vercel**
- Check: `vercel.json` is correct
- Check: All dependencies in `package.json`
- Check: Build command works locally

**Issue: 404 on API endpoints**
- Check: Rewrites in `vercel.json`
- Check: Serverless functions deployed
- Check: Vercel function logs

---

**Documentation Maintained By:** Cursor AI + Development Team  
**Next Review:** February 15, 2026  
**Version Control:** This file is tracked in Git
