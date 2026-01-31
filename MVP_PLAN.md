# 🎯 TripMaker MVP Plan & Feature Breakdown

> **Last Updated:** January 31, 2026 (unarchive + MVP2 start)  
> **Current Phase:** MVP2 (Collaboration & Community)  
> **Status:** MVP1 100% complete; MVP2 in progress

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
- ✅ Vercel free tier for hosting
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

### 🟢 MVP2: Collaboration & Community (CURRENT PHASE)

**Goal:** Users can share trips, collaborate, and discover others' trips.

**Started:** January 31, 2026 (after MVP1 complete)

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 2.1 | Day-wise route lines on map | 📋 Planned | P1 |
| 2.2 | AI-powered suggestions (any place) | 📋 Planned | P1 |
| 2.3 | Transportation mode selection | 📋 Planned | P0 |
| 2.4 | Start from airport/station/bus | 📋 Planned | P0 |
| 2.5 | Public timeline/feed | 📋 Planned | P0 |
| 2.6 | Post trips to timeline | 📋 Planned | P0 |
| 2.7 | Invite collaborators (viewer/editor) | 📋 Planned | P1 |
| 2.8 | One-time access codes | 📋 Planned | P1 |

**MVP2 Start Date:** January 31, 2026

---

### 🟡 MVP3: Real-Time Trip Execution

**Goal:** Live trip tracking, collaboration tools, social features.

**Blocked By:** MVP2 completion

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 3.1 | Timeline/feed preferences | ⏸️ BLOCKED | P2 |
| 3.2 | Real-time location tracking | ⏸️ BLOCKED | P0 |
| 3.3 | Live map with current location | ⏸️ BLOCKED | P0 |
| 3.4 | ETA, delays, alerts | ⏸️ BLOCKED | P1 |
| 3.5 | In-trip chat | ⏸️ BLOCKED | P1 |
| 3.6 | Media upload in chat | ⏸️ BLOCKED | P2 |
| 3.7 | Like/comment on feed trips | ⏸️ BLOCKED | P1 |
| 3.8 | Share trips externally | ⏸️ BLOCKED | P2 |

**MVP3 Start Date:** TBD (After MVP2 complete)

---

### 🟡 MVP4: Smart Recommendations

**Goal:** Real-time transport and accommodation suggestions with pricing.

**Blocked By:** MVP3 completion

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 4.1 | Transport method suggestions | ⏸️ BLOCKED | P0 |
| 4.2 | Multi-source pricing (Skyscanner, etc) | ⏸️ BLOCKED | P0 |
| 4.3 | Stay/accommodation suggestions | ⏸️ BLOCKED | P1 |
| 4.4 | Price comparison | ⏸️ BLOCKED | P1 |

**MVP4 Start Date:** TBD (After MVP3 complete)

---

### 🟡 MVP5: Enterprise Features

**Goal:** Travel agency templates and monetization.

**Blocked By:** MVP4 completion

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 5.1 | Agency account type | ⏸️ BLOCKED | P0 |
| 5.2 | Create trip templates | ⏸️ BLOCKED | P0 |
| 5.3 | Push templates to users | ⏸️ BLOCKED | P1 |
| 5.4 | Request to join templates | ⏸️ BLOCKED | P1 |
| 5.5 | Template marketplace | ⏸️ BLOCKED | P2 |

**MVP5 Start Date:** TBD (After MVP4 complete)

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

#### Task 1.1.5: Vercel - Create Trip Serverless Function ✅
- [x] Create `api/trips/index.js` (GET list + POST create)
- [x] Create `api/trips/[id].js` (GET single)
- [x] Add CORS headers and JWT auth
- [x] **Acceptance:** Production endpoints work

#### Task 1.1.6: Vercel - List Trips Serverless Function ✅
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

#### Task 1.4.2: Vercel - Update Trip Function ✅
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

#### Task 1.5.3: Vercel Functions ✅
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
- [ ] Deployed to Vercel successfully
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

---

## 📞 Contact & Support

**Questions about this plan?**
- Review `APP_ARCHITECTURE.md` for technical details
- Review `API_REFERENCE.md` for API specs
- Check `.cursorrules` for coding standards
- Consult DEVELOPMENT_STATUS.md for current sprint

---

**Last Updated:** January 31, 2026 (trip create API)  
**Next Review:** After completing Phase 1.1 (Save Trip)  
**Maintained By:** Development Team
