# 🎯 TripMaker MVP Plan & Feature Breakdown

> **Last Updated:** February 7, 2026  
> **Current Phase:** Ready for MVP4 (AI Trip Agent)  
> **Status:** MVP1 100%; MVP2 100%; MVP3 100%; Design Optimization complete; MVP4 (AI Trip Agent) not started (awaiting approval). See [MVP4_AI_AGENT.md](MVP4_AI_AGENT.md).

---

## 📋 Problem Statement

**Pain Point:** Planning and managing trip itineraries is difficult and requires extensive human interaction in conventional methods.

**User Challenges:**
- Hard to visualize entire trip flow
- Difficult to manage day-by-day activities
- No easy way to share and collaborate
- Manual coordination with travel companions
- Lost trip memories and details over time

---

## 💡 Solution Overview

**TripMaker (Waypoint)** helps users:
1. ✨ Create and visualize trip itineraries on interactive maps
2. 📅 See day-wise breakdown with timeline of activities
3. 👥 Add collaborators and share trips
4. 🌍 Discover trips from community timeline
5. 📱 Track trip status live during execution
6. 💾 Store and access trip memories

**Key Principle:** Zero-cost MVP using:
- ✅ Render free tier for hosting
- ✅ Local file storage (JSON)
- ✅ OpenStreetMap (free mapping)
- ✅ Hardcoded city data (no AI costs)
- ✅ Client-side processing where possible

---

## 🎯 MVP Phase Breakdown

### 🟢 MVP1: Core Trip Planning (COMPLETE)

**Goal:** Users can create, customize, and manage trip itineraries with map visualization.

**Priority:** CRITICAL - Foundation for all future features

#### Features & Status

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 1.1 | Enter destination, pace, days | ✅ DONE | P0 |
| 1.2 | Generate day-wise itinerary | ✅ DONE | P0 |
| 1.3 | Map preview with markers | ✅ DONE | P0 |
| 1.4 | Day-wise timeline view | ✅ DONE | P0 |
| 1.5 | Inline edit activities/places | ✅ DONE | P1 |
| 1.6 | **Save/Create Trip** | ✅ DONE | **P0** |
| 1.7 | View saved trips list | ✅ DONE | P0 |
| 1.8 | Edit saved trip | ✅ DONE | P1 |
| 1.9 | Delete trip | ✅ DONE | P1 |
| 1.10 | Archive trip (+ Unarchive) | ✅ DONE | P2 |
| 1.11 | Mark trip as complete | ✅ DONE | P2 |
| 1.12 | Trip start/end points (transport) | ✅ DONE | P2 |
| 1.13 | Hardcoded city suggestions | ✅ DONE | P0 |

**MVP1 Completion:** 100% (13/13 features)

---

### 🟢 MVP2: Collaboration & Community (COMPLETE)

**Goal:** Users can share trips, collaborate, and discover others' trips.

**Started:** January 31, 2026 | **Completed:** January 31, 2026

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 2.1 | Day-wise route lines on map | ✅ DONE | P1 |
| 2.2 | AI-powered suggestions (any place) | ✅ DONE | P1 |
| 2.3 | Transportation mode selection | ✅ DONE | P0 |
| 2.4 | Start from airport/station/bus | ✅ DONE | P0 |
| 2.5 | Public timeline/feed | ✅ DONE | P0 |
| 2.6 | Post trips to timeline | ✅ DONE | P0 |
| 2.7 | Invite collaborators (viewer/editor) | ✅ DONE | P1 |
| 2.8 | One-time access codes | ✅ DONE | P1 |

**MVP2 Completion:** 100% (8/8 features)

---

### 🟢 MVP3: Real-Time Trip Execution (COMPLETE)

**Goal:** Live trip tracking, collaboration tools, social features.

**Completed:** February 2026

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 3.1 | Timeline/feed preferences | ✅ DONE | P2 |
| 3.2 | Real-time location tracking | ✅ DONE | P0 |
| 3.3 | Live map with current location | ✅ DONE | P0 |
| 3.4 | ETA, delays, alerts | ✅ DONE | P1 |
| 3.5 | In-trip chat | ✅ DONE | P1 |
| 3.6 | Media upload in chat (R2, 100MB/user) | ✅ DONE | P2 |
| 3.7 | Like/comment on feed trips | ✅ DONE | P1 |
| 3.8 | Share trips externally | ✅ DONE | P2 |
| 3.9 | Trip gallery (per-trip images, not chat) | ✅ DONE | P1 |
| 3.10 | Trip thumbnail (cover image) | ✅ DONE | P1 |
| 3.11 | Comments support images (trip + gallery image) | ✅ DONE | P2 |
| 3.12 | Gallery page (carousel, prev/next, likes/comments per image) | ✅ DONE | P1 |
| 3.13 | Listings: trip thumbnail + gallery preview (Discover) | ✅ DONE | P1 |

**MVP3 Completion:** 100% (13/13 features)

#### MVP3 Gallery & Thumbnail (Feb 2026)

- **Trip gallery:** Each trip has a dedicated gallery (not chat images). Trip Detail shows a row of images + "Gallery" button opening full gallery. Gallery items support likes and comments (with optional image).
- **Trip thumbnail:** Each trip can have a cover/thumbnail image; add or update after creation. Used in My Trips and Discover cards.
- **Discover:** Cards show trip thumbnail and, when available, other gallery images (strip or preview).

#### MVP3 Media Storage (Feature 3.6 + Profile/Settings)

Media uploads in chat (3.6) will use **Cloudflare R2** for storage. User-level limits and visibility are part of the plan:

- **Storage:** Cloudflare R2 (approved for MVP3 media; use free tier where applicable).
- **Per-user upload limit:** **100 MB** total per user (enforced server-side).
- **Visibility:** Each user’s storage usage (e.g. “X MB used / 100 MB”) is shown in **Profile** or **Settings**, so users can see how much of their quota they’ve used.
- **Implementation:** Add storage backend and usage tracking as MVP3 tasks progress; profile/settings UI for usage display can be implemented when media upload is built or shortly after.

---

### 🟡 MVP4: AI Trip Agent

**Goal:** Users create and edit trips by chatting with an AI agent; any destination/pace/days; AI returns data in the same format as existing trip plan. Provider-agnostic adapter pattern; user supplies API keys. See [MVP4_AI_AGENT.md](MVP4_AI_AGENT.md).

**Prerequisites:** MVP3 complete ✅; Design Optimization complete ✅; user approval to start MVP4.

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 4.1 | Backend adapter (interface + e.g. Gemini, Groq, OpenRouter); env config; fallback to static planner | ⏸️ Not started | P0 |
| 4.2 | Chat endpoint(s): messages + context → plan response (same as `/trips/plan`) | ⏸️ Not started | P0 |
| 4.3 | Frontend: AI chat after destination/pace/days; "Start over"; itinerary preview; create trip | ⏸️ Not started | P0 |
| 4.4 | Frontend: AI chat FAB on relevant screens for trip edits (create + edit only in MVP4) | ⏸️ Not started | P1 |
| 4.5 | Keep existing static plan flow; AI is alternative path | ⏸️ Not started | P0 |

**MVP4 Start Date:** After explicit user approval (see MVP_ROADMAP.md). **Status:** MVP4 is complete (see MVP_ROADMAP.md). Trip Detail entry point is the in-content AI insights accordion (simple title, expand to chat).

---

### 🟢 MVP4+ AI Capability Enhancements (COMPLETE)

**Goal:** Richer AI for trip creation, editing, and ongoing-trip insights.

**Completed:**
1. **Trip creation enhancements (AI)** — "Gather-before-plan" conversational flow intercepts vague queries until destination and duration are gathered.
2. **Trip edit / ongoing trip AI enhancements** — **Fully functional AI chat–based edit trip** with a dedicated FAB floating component on Trip Detail for instant conversational modifications to living itineraries.

---

### 🟡 MVP5: Marketplace Integration

**Goal:** Real pricing and booking options (paid services).

**Prerequisites:** MVP4 (AI Trip Agent) complete ✅; user approval to start MVP5.

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 5.1 | Transport pricing (Skyscanner API) | ⏸️ Not started | P0 |
| 5.2 | Accommodation suggestions (Booking.com, etc.) | ⏸️ Not started | P1 |
| 5.3 | Price comparison view | ⏸️ Not started | P1 |

**MVP5 Start Date:** After MVP4 complete and explicit user approval.

---

### 🟡 MVP6: Enterprise Features

**Goal:** Travel agency templates and monetization.

**Blocked By:** MVP5 completion

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 6.1 | Agency account type | ⏸️ BLOCKED | P0 |
| 6.2 | Create trip templates | ⏸️ BLOCKED | P0 |
| 6.3 | Push templates to users | ⏸️ BLOCKED | P1 |
| 6.4 | Request to join templates | ⏸️ BLOCKED | P1 |
| 6.5 | Template marketplace | ⏸️ BLOCKED | P2 |

**MVP6 Start Date:** TBD (After MVP5 complete)

---

## 🚀 MVP1 Detailed Task Breakdown

### Phase 1.1: Save Trip Functionality (NEXT UP)

**Goal:** Enable users to save generated trip plans as persistent trips.

**Tasks:** (All tasks are atomic and demo-safe)

#### Task 1.1.1: Backend - Trip Storage Schema ✅
- [x] Add `trips` array to user object in `data/users.json`
- [x] Define trip schema: `{ id, userId, name, destination, days, pace, itinerary, createdAt, updatedAt, status }`
- [x] Add trip helper functions in `server.js`
- [x] **Acceptance:** User data structure supports trips array

#### Task 1.1.2: Backend - Create Trip API ✅
- [x] Add `POST /trips` endpoint with authentication
- [x] Validate trip data (name, destination, itinerary)
- [x] Save trip to user's trips array
- [x] Return saved trip with generated ID
- [x] Add Swagger documentation
- [x] **Acceptance:** `curl` test successfully creates trip

#### Task 1.1.3: Backend - List Trips API ✅
- [x] Add `GET /trips` endpoint with authentication
- [x] Return user's trips sorted by `createdAt` (newest first)
- [x] Filter by status (optional query param)
- [x] Add Swagger documentation
- [x] **Acceptance:** `curl` test returns user's trips

#### Task 1.1.4: Backend - Get Single Trip API ✅
- [x] Add `GET /trips/:id` endpoint with authentication
- [x] Verify trip belongs to authenticated user
- [x] Return 404 if not found or unauthorized
- [x] Add Swagger documentation
- [x] **Acceptance:** `curl` test retrieves specific trip

#### Task 1.1.5: Create Trip API (backend) ✅
- [x] Create `api/trips/index.js` (GET list + POST create)
- [x] Create `api/trips/[id].js` (GET single)
- [x] Add CORS headers and JWT auth
- [x] **Acceptance:** Production endpoints work

#### Task 1.1.6: List Trips API (backend) ✅
- [x] Handled in `api/trips/index.js` (GET)
- [x] **Acceptance:** Production endpoint works

#### Task 1.1.7: Frontend - Trip Service Layer ✅
- [x] Create `src/services/trips.js`
- [x] Add `createTrip(payload)`, `fetchTrips()`, `fetchTrip(id)`
- [x] Use API_BASE_URL + Authorization header
- [x] **Acceptance:** Service functions work locally

#### Task 1.1.8: Frontend - Save Trip UI ✅
- [x] Add "Save Trip" button on Home page (after plan generated)
- [x] Add trip name input modal/form
- [x] Show loading state during save
- [x] Show success message with link to "My Trips"
- [x] Handle errors gracefully
- [x] **Acceptance:** User can save generated plan

#### Task 1.1.9: Testing & Documentation ✅
- [ ] Test full flow: generate → save → verify
- [ ] Update `API_REFERENCE.md` with new endpoints
- [ ] Update `APP_ARCHITECTURE.md` with trip data flow
- [ ] Update this MVP_PLAN.md status
- [ ] **Acceptance:** All docs reflect new feature

---

### Phase 1.2: View Trips List

**Goal:** Users can see all their saved trips.

#### Task 1.2.1: Frontend - Trips Page Component ✅
- [x] Create `src/pages/Trips.jsx`
- [x] Fetch trips on mount
- [x] Show loading state
- [x] Display empty state if no trips
- [x] Show trip cards with: name, destination, days, status, dates
- [x] Add "Create New Trip" button → links to Home
- [x] **Acceptance:** Page displays user's trips

#### Task 1.2.2: Frontend - Trip Card Component ✅
- [x] Trip cards with status badge (upcoming/active/completed/archived)
- [x] View link to `/trips/:id`
- [x] **Acceptance:** Trips displayed as attractive cards

#### Task 1.2.3: Frontend - Navigation Integration ✅
- [x] Add "My Trips" link to SiteLayout navigation
- [x] Add routes `/trips` and `/trips/:id` in App.jsx
- [x] Protect routes with RequireAuth
- [x] Update i18n translations (trips.*, nav.trips)
- [x] **Acceptance:** User can navigate to My Trips

#### Task 1.2.4: Testing & Documentation ✅
- [ ] Test trips list with 0, 1, 5+ trips
- [ ] Test loading states
- [ ] Update documentation
- [ ] **Acceptance:** Trips page works perfectly

---

### Phase 1.3: View Single Trip

**Goal:** Users can view detailed trip information.

#### Task 1.3.1: Frontend - Trip Detail Page ✅
- [ ] Create `src/pages/TripDetail.jsx`
- [ ] Fetch trip by ID from route params
- [ ] Display trip header (name, destination, dates)
- [ ] Show map preview
- [ ] Display full day-by-day itinerary
- [ ] Add back button to trips list
- [ ] **Acceptance:** User can view trip details

#### Task 1.3.2: Frontend - Trip Actions Bar ✅
- [ ] Add action bar: Edit, Delete, Archive, Share
- [ ] Implement Edit → opens edit mode
- [ ] Implement Delete → confirmation modal
- [ ] Implement Archive (updates status)
- [ ] Disable actions based on trip status
- [ ] **Acceptance:** Actions work correctly

#### Task 1.3.3: Frontend - Route Integration ✅
- [ ] Add route `/trips/:id` in App.jsx
- [ ] Handle invalid trip IDs (404 page)
- [ ] Protect route with RequireAuth
- [ ] Update i18n translations
- [ ] **Acceptance:** Detail page accessible

---

### Phase 1.4: Edit Trip

**Goal:** Users can modify saved trips.

#### Task 1.4.1: Backend - Update Trip API ✅
- [ ] Add `PUT /trips/:id` endpoint with authentication
- [ ] Validate ownership
- [ ] Allow updating: name, itinerary, days
- [ ] Update `updatedAt` timestamp
- [ ] Add Swagger documentation
- [ ] **Acceptance:** API updates trip correctly

#### Task 1.4.2: Update Trip API (backend) ✅
- [ ] Create `api/trips/update.js`
- [ ] Mirror backend logic
- [ ] Test with deployed endpoint
- [ ] **Acceptance:** Production endpoint works

#### Task 1.4.3: Frontend - Edit Mode UI ✅
- [ ] Toggle edit mode on Trip Detail page
- [ ] Enable inline editing of activities
- [ ] Add "Save Changes" button
- [ ] Add "Cancel" button (reverts changes)
- [ ] Show unsaved changes warning
- [ ] **Acceptance:** User can edit and save

---

### Phase 1.5: Delete & Archive Trips

**Goal:** Users can delete or archive trips.

#### Task 1.5.1: Backend - Delete Trip API ✅
- [ ] Add `DELETE /trips/:id` endpoint with authentication
- [ ] Verify ownership
- [ ] Remove trip from user's trips array
- [ ] Return success response
- [ ] Add Swagger documentation
- [ ] **Acceptance:** API deletes trip

#### Task 1.5.2: Backend - Archive Trip API ✅
- [x] Add `PATCH /trips/:id/archive` endpoint
- [x] Update trip status to 'archived'
- [x] Add Swagger documentation
- [x] **Acceptance:** API archives trip

#### Task 1.5.2b: Backend - Unarchive Trip API ✅
- [x] Add `PATCH /trips/:id/unarchive` endpoint
- [x] Set trip status to 'upcoming'
- [x] Add Swagger documentation
- [x] **Acceptance:** API unarchives trip

#### Task 1.5.3: Backend/API ✅
- [ ] Create `api/trips/delete.js`
- [ ] Create `api/trips/archive.js`
- [ ] Test endpoints
- [ ] **Acceptance:** Production works

#### Task 1.5.4: Frontend - Delete Functionality ✅
- [ ] Add confirmation modal for delete
- [ ] Call delete API
- [ ] Redirect to trips list after delete
- [ ] Show success message
- [ ] **Acceptance:** Delete works safely

#### Task 1.5.5: Frontend - Archive & Unarchive Functionality ✅
- [x] Add archive button (trip detail)
- [x] Add unarchive button when trip is archived
- [x] Update UI to show archived status
- [x] Filter archived trips in list; "Show archived" / "Hide archived" toggle
- [x] **Acceptance:** Archive and unarchive work correctly

---

### Phase 1.6: Map Preview Enhancement

**Goal:** Reliable map preview with destination markers.

#### Task 1.6.1: Map Service Selection ✅
- [x] Evaluate free map services (done - using OSM tiles)
- [x] Add "View in OpenStreetMap" link (in map footer)
- [x] Static/cache for common cities (geocode.js)
- [ ] **Acceptance:** Map works reliably ✅

#### Task 1.6.2: Map Markers ✅
- [x] Leaflet + react-leaflet for interactive map
- [x] Destination marker (red), itinerary markers (blue)
- [x] Popups with location details
- [x] Geocode itinerary places (Nominatim, rate-limited)
- [ ] **Acceptance:** Markers show on map ✅

---

## 📊 Current Status Summary

### ✅ Completed Features
1. User authentication (register/login/logout)
2. User profile management
3. Trip plan generator (destination, pace, days)
4. Day-wise itinerary generation
5. Inline editing of activities
6. Map preview with markers (Leaflet, destination + itinerary markers, popups)
7. Hardcoded city data (Paris, Tokyo, NYC)
8. Multi-language support (6 languages)

### 🔧 In Progress
1. (None – map preview with markers complete)

### ❌ Critical Missing (Blocking MVP1)
1. ~~**Save/Create Trip**~~ ✅ Done
2. ~~List saved trips~~ ✅ Done
3. View trip details (minimal TripDetail page done)
4. Edit saved trip
5. Delete trip
6. Archive trip

### 📈 Progress Metrics
- **MVP1 Overall:** 40% complete
- **Backend:** 50% complete (auth + profile done, trips missing)
- **Frontend:** 35% complete (planning done, CRUD missing)
- **Documentation:** 70% complete

---

## 🎯 Next Sprint Focus

### Sprint Goal: Enable Trip Saving & Management
**Duration:** 5-7 days  
**Outcome:** Users can save, view, edit, and delete trips

### Sprint Tasks (Priority Order)
1. ✅ Task 1.1.1: Trip storage schema
2. ✅ Task 1.1.2: Create trip API
3. ✅ Task 1.1.3: List trips API
4. ✅ Task 1.1.4: Get single trip API
5. ✅ Task 1.1.7: Frontend trip service
6. ✅ Task 1.1.8: Save trip UI
7. ✅ Task 1.2.1: Trips list page
8. ✅ Task 1.3.1: Trip detail page

---

## 🚨 Important Development Rules

### 1. Demo-Ready at All Times
- ✅ Every commit must result in a working app
- ✅ No broken states allowed in main branch
- ✅ Test thoroughly before committing
- ✅ Rollback if anything breaks

### 2. Transaction-Based Development
- ✅ Complete entire task before moving to next
- ✅ Either fully done or not started
- ✅ No half-implemented features
- ✅ Feature flags for large changes

### 3. Documentation First
- ✅ Update docs before/during development
- ✅ Keep API_REFERENCE.md current
- ✅ Update APP_ARCHITECTURE.md for data changes
- ✅ Update this MVP_PLAN.md for status changes

### 4. Scope Discipline
- ❌ No features outside current MVP phase
- ❌ No "nice to have" additions
- ❌ No premature optimization
- ✅ Focus on completing current phase 100%

### 5. Zero-Cost Commitment
- ✅ Only free tier services
- ✅ No paid APIs during MVP1-2
- ✅ Hardcoded data when possible
- ✅ Client-side processing preferred

---

## 🌐 Browser Verification (Required After Each Task)

**Principle:** Every completed task must be verified in a real browser to ensure flawless functionality and no regressions (e.g. one-character input bug, broken forms).

**Process:**
1. Run `npm run dev` (frontend + backend).
2. Open http://localhost:5173 in a browser.
3. Follow the relevant flows in **`MVP1_BROWSER_TEST_CHECKLIST.md`** for the feature you changed.
4. Confirm: no console errors, affected flows work end-to-end (login → plan → edit → save → trips list → detail → actions).
5. Do not mark the task complete until browser verification passes.

**Reference:** See `MVP1_BROWSER_TEST_CHECKLIST.md` for the full checklist (auth, trip planning, edit day, place suggestions, save trip, My Trips, trip detail, archive/unarchive/delete).

---

## 📋 Definition of Done (DoD)

### For Each Task
- [ ] Code implemented and tested locally
- [ ] No console errors or warnings
- [ ] Works in both dev and production
- [ ] **Verified in browser:** Relevant flows from MVP1_BROWSER_TEST_CHECKLIST.md exercised; no regressions
- [ ] API documented in API_REFERENCE.md
- [ ] Architecture updated if data model changed
- [ ] This MVP_PLAN.md status updated
- [ ] Git commit with clear message

### For Each Phase
- [ ] All tasks completed (100%)
- [ ] All tests passing
- [ ] Documentation complete and accurate
- [ ] Demo video/screenshots prepared
- [ ] Deployed to Render successfully
- [ ] Smoke tested on production
- [ ] Team review completed
- [ ] Ready for next phase

---

## 🔄 Change Log

### January 31, 2026
- ✅ Created MVP_PLAN.md
- ✅ Analyzed current implementation
- ✅ Identified critical gap (Save Trip feature)
- ✅ Broke down MVP1 into atomic tasks
- ✅ Defined MVP phases 1-5
- ✅ Established development rules
- ✅ Implemented backend POST /trips create endpoint
- 🧹 Removed redundant documentation summaries and setup/deploy notes

### February 3, 2026
- 📝 **MVP3 media storage:** Cloudflare R2 approved for in-trip chat media (feature 3.6)
- 📝 **Per-user limit:** 100 MB per user, enforced server-side
- 📝 **Visibility:** Storage usage (e.g. X MB / 100 MB) shown in Profile or Settings; implement as tasks progress

---

## 📞 Contact & Support

**Questions about this plan?**
- Review `APP_ARCHITECTURE.md` for technical details
- Review `API_REFERENCE.md` for API specs
- Check `.cursorrules` for coding standards
- Consult DEVELOPMENT_STATUS.md for current sprint

---

**Last Updated:** February 3, 2026 (MVP3 media: R2 + 100MB/user)  
**Next Review:** After MVP3 task breakdown  
**Maintained By:** Development Team
