# 🎯 TripMaker MVP Plan & Feature Breakdown

> **Last Updated:** January 31, 2026  
> **Current Phase:** MVP1 (In Development)  
> **Status:** 40% Complete

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

### 🟢 MVP1: Core Trip Planning (CURRENT PHASE)

**Goal:** Users can create, customize, and manage trip itineraries with map visualization.

**Priority:** CRITICAL - Foundation for all future features

#### Features & Status

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 1.1 | Enter destination, pace, days | ✅ DONE | P0 |
| 1.2 | Generate day-wise itinerary | ✅ DONE | P0 |
| 1.3 | Map preview with markers | 🔧 IN PROGRESS | P0 |
| 1.4 | Day-wise timeline view | ✅ DONE | P0 |
| 1.5 | Inline edit activities/places | ✅ DONE | P1 |
| 1.6 | **Save/Create Trip** | ❌ TODO | **P0** |
| 1.7 | View saved trips list | ❌ TODO | P0 |
| 1.8 | Edit saved trip | ❌ TODO | P1 |
| 1.9 | Delete trip | ❌ TODO | P1 |
| 1.10 | Archive trip | ❌ TODO | P2 |
| 1.11 | Mark trip as complete | ❌ TODO | P2 |
| 1.12 | Trip start/end points (transport) | ❌ TODO | P2 |
| 1.13 | Hardcoded city suggestions | ✅ DONE | P0 |

**MVP1 Completion:** 40% (5/13 features)

---

### 🟡 MVP2: Collaboration & Community

**Goal:** Users can share trips, collaborate, and discover others' trips.

**Blocked By:** MVP1 completion

#### Features

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 2.1 | Day-wise route lines on map | ⏸️ BLOCKED | P1 |
| 2.2 | AI-powered suggestions (any place) | ⏸️ BLOCKED | P1 |
| 2.3 | Transportation mode selection | ⏸️ BLOCKED | P0 |
| 2.4 | Start from airport/station/bus | ⏸️ BLOCKED | P0 |
| 2.5 | Public timeline/feed | ⏸️ BLOCKED | P0 |
| 2.6 | Post trips to timeline | ⏸️ BLOCKED | P0 |
| 2.7 | Invite collaborators (viewer/editor) | ⏸️ BLOCKED | P1 |
| 2.8 | One-time access codes | ⏸️ BLOCKED | P1 |

**MVP2 Start Date:** TBD (After MVP1 complete)

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
- [ ] Add `trips` array to user object in `data/users.json`
- [ ] Define trip schema: `{ id, userId, name, destination, days, pace, itinerary, createdAt, updatedAt, status }`
- [ ] Add trip helper functions in `server.js`
- [ ] **Acceptance:** User data structure supports trips array

#### Task 1.1.2: Backend - Create Trip API ✅
- [ ] Add `POST /trips` endpoint with authentication
- [ ] Validate trip data (name, destination, itinerary)
- [ ] Save trip to user's trips array
- [ ] Return saved trip with generated ID
- [ ] Add Swagger documentation
- [ ] **Acceptance:** `curl` test successfully creates trip

#### Task 1.1.3: Backend - List Trips API ✅
- [ ] Add `GET /trips` endpoint with authentication
- [ ] Return user's trips sorted by `createdAt` (newest first)
- [ ] Filter by status (optional query param)
- [ ] Add pagination support (limit/offset)
- [ ] Add Swagger documentation
- [ ] **Acceptance:** `curl` test returns user's trips

#### Task 1.1.4: Backend - Get Single Trip API ✅
- [ ] Add `GET /trips/:id` endpoint with authentication
- [ ] Verify trip belongs to authenticated user
- [ ] Return 404 if not found or unauthorized
- [ ] Add Swagger documentation
- [ ] **Acceptance:** `curl` test retrieves specific trip

#### Task 1.1.5: Vercel - Create Trip Serverless Function ✅
- [ ] Create `api/trips/create.js`
- [ ] Mirror logic from backend `POST /trips`
- [ ] Add CORS headers
- [ ] Test with deployed endpoint
- [ ] **Acceptance:** Production endpoint works

#### Task 1.1.6: Vercel - List Trips Serverless Function ✅
- [ ] Create `api/trips/list.js`
- [ ] Mirror logic from backend `GET /trips`
- [ ] Add CORS headers
- [ ] Test with deployed endpoint
- [ ] **Acceptance:** Production endpoint works

#### Task 1.1.7: Frontend - Trip Service Layer ✅
- [ ] Create `src/services/trips.js`
- [ ] Add `createTrip(payload)` function
- [ ] Add `fetchTrips()` function
- [ ] Add `fetchTrip(id)` function
- [ ] Use API_BASE_URL pattern
- [ ] **Acceptance:** Service functions work locally

#### Task 1.1.8: Frontend - Save Trip UI ✅
- [ ] Add "Save Trip" button on Home page (after plan generated)
- [ ] Add trip name input modal/form
- [ ] Show loading state during save
- [ ] Show success message with link to "My Trips"
- [ ] Handle errors gracefully
- [ ] **Acceptance:** User can save generated plan

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
- [ ] Create `src/pages/Trips.jsx`
- [ ] Fetch trips on mount
- [ ] Show loading state
- [ ] Display empty state if no trips
- [ ] Show trip cards with: name, destination, days, dates
- [ ] Add "Create New Trip" button → redirects to Home
- [ ] **Acceptance:** Page displays user's trips

#### Task 1.2.2: Frontend - Trip Card Component ✅
- [ ] Create trip card with thumbnail map
- [ ] Show trip status badge (upcoming/active/completed)
- [ ] Show action buttons (View, Edit, Delete)
- [ ] Add hover effects
- [ ] Make card clickable → opens trip details
- [ ] **Acceptance:** Trips displayed as attractive cards

#### Task 1.2.3: Frontend - Navigation Integration ✅
- [ ] Add "My Trips" link to SiteLayout navigation
- [ ] Add route `/trips` in App.jsx
- [ ] Protect route with RequireAuth
- [ ] Update i18n translations
- [ ] **Acceptance:** User can navigate to My Trips

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
- [ ] Add `PATCH /trips/:id/archive` endpoint
- [ ] Update trip status to 'archived'
- [ ] Add Swagger documentation
- [ ] **Acceptance:** API archives trip

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

#### Task 1.5.5: Frontend - Archive Functionality ✅
- [ ] Add archive button
- [ ] Update UI to show archived status
- [ ] Filter archived trips in list
- [ ] Add "Show Archived" toggle
- [ ] **Acceptance:** Archive works correctly

---

### Phase 1.6: Map Preview Enhancement

**Goal:** Reliable map preview with destination markers.

#### Task 1.6.1: Map Service Selection ✅
- [x] Evaluate free map services (done - using OSM tiles)
- [ ] Implement fallback if map fails
- [ ] Add "View in OpenStreetMap" link always
- [ ] Cache coordinates for common cities
- [ ] **Acceptance:** Map works reliably

#### Task 1.6.2: Map Markers ✅
- [ ] Research marker overlay options
- [ ] Implement simple marker solution
- [ ] Test with all 3 cities (Paris, Tokyo, NYC)
- [ ] **Acceptance:** Markers show on map

---

## 📊 Current Status Summary

### ✅ Completed Features
1. User authentication (register/login/logout)
2. User profile management
3. Trip plan generator (destination, pace, days)
4. Day-wise itinerary generation
5. Inline editing of activities
6. Basic map preview (with tiles)
7. Hardcoded city data (Paris, Tokyo, NYC)
8. Multi-language support (6 languages)

### 🔧 In Progress
1. Map preview reliability improvements

### ❌ Critical Missing (Blocking MVP1)
1. **Save/Create Trip** (highest priority)
2. List saved trips
3. View trip details
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

## 📋 Definition of Done (DoD)

### For Each Task
- [ ] Code implemented and tested locally
- [ ] No console errors or warnings
- [ ] Works in both dev and production
- [ ] API documented in API_REFERENCE.md
- [ ] Architecture updated if data model changed
- [ ] This MVP_PLAN.md status updated
- [ ] Git commit with clear message
- [ ] Verified working in browser

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

---

## 📞 Contact & Support

**Questions about this plan?**
- Review `APP_ARCHITECTURE.md` for technical details
- Review `API_REFERENCE.md` for API specs
- Check `.cursorrules` for coding standards
- Consult DEVELOPMENT_STATUS.md for current sprint

---

**Last Updated:** January 31, 2026  
**Next Review:** After completing Phase 1.1 (Save Trip)  
**Maintained By:** Development Team
