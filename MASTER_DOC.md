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
