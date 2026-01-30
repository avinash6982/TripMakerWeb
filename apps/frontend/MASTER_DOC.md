# Master Doc - Waypoint App Evolution

## Product Intent
Waypoint is being built as a trip management platform where users can create,
plan, and manage trips with shared collaboration features. The current phase
focuses on account access, profile settings, and establishing the app shell for
future trip functionality.

## Current App Structure
- **Frontend:** React + Vite, React Router for auth/app routes, i18next for
  multilingual UI (English, Hindi, Malayalam, Arabic, Spanish, German).
- **Backend:** Node + Express, file-based storage for users and profiles, CORS
  configuration for the deployed frontend.
- **Auth Flow:** Login and registration with local storage to retain session
  details. Profile settings are fetched and updated via backend endpoints.

## Change Log
### 2026-01-20
- Reset the UI so the initial landing experience is **login/sign-up only**.
- Added a clean app shell with **Home** and **Profile** pages for future trip
  features.
- Fixed the **country selection** in profile settings by switching to a
  controlled select list.
- Added this master doc to track product intent and evolution.

## Backend Update Policy
Backend changes are applied manually in the TripMakerWeb-BE repository using a
Cursor prompt (no local clone in this workspace). Keep backend changes aligned
with the frontend profile API contract.

## Documentation

### ⚠️ Important: Backend Has Been Updated with JWT

The backend now includes JWT authentication. Frontend migration is pending.

### Current Documentation (For JWT-Enabled Backend)
- **[Swagger API Docs](https://trip-maker-web-be.vercel.app/api-docs)** - 
  PRIMARY source of truth for all API contracts. Always up-to-date.
- **[MIGRATION_NOTICE.md](./MIGRATION_NOTICE.md)** - Explains JWT changes and
  migration requirements.
- **Backend Migration Guide** - Step-by-step frontend migration instructions
  (Location: `TripMakerWeb-BE/FRONTEND_MIGRATION_GUIDE.md`)

### Original Documentation (Pre-JWT Implementation)
- **[FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)** -
  Comprehensive documentation on how the frontend works (original implementation).
  ⚠️ Does not include JWT - see Swagger for current API.
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - Quick reference
  for original API endpoints. ⚠️ Pre-JWT - see Swagger for current contracts.
- **[INTEGRATION_FLOWS.md](./INTEGRATION_FLOWS.md)** - Visual flows for
  original implementation. ⚠️ Missing JWT token handling.
