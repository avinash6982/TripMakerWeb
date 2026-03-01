# 🗺️ TripMaker MVP Roadmap

**Last Updated:** February 2026  
**Current Phase:** UI work paused; ready for next phase  
**Overall Progress:** MVP1 100%; MVP2 100%; MVP3 100%; MVP4 100%; Prerequisites 100%; Design Optimization complete; UI Enhancement (login, register, trip creation, headers/lists/trip-detail consistency) done and paused. **Next:** Improvements phase (optional) or MVP5 (Marketplace) when approved; or R2 (uploads), MongoDB (optional). See DEVELOPMENT_STATUS.md.

---

## Problem Statement

Traditional trip planning is fragmented and requires heavy manual coordination:
- ❌ Multiple tools for planning, tracking, and collaboration
- ❌ Difficult to visualize entire trip flow
- ❌ Hard to coordinate with travel companions
- ❌ No centralized place for trip memories

## Solution

**TripMaker (Waypoint)** provides an all-in-one platform for trip planning, execution, and memories:
- ✅ Visual map-based trip planning
- ✅ Day-wise itinerary breakdown
- ✅ Real-time collaboration
- ✅ Public trip sharing and inspiration
- ✅ Trip memory preservation

---

## Development Principles

### 1. Transactional Development
- **Every commit = working demo**
- No half-implemented features in main
- Use feature flags for WIP

### 2. Zero-Cost MVP (Phases 1-3)
- Use free geocoding APIs
- Mock data for AI suggestions
- Render free tier hosting
- No paid services until MVP4+

### 3. Scope Discipline
- Only implement current phase features
- Document scope change requests
- Get explicit approval before jumping phases

---

## MVP Phase Breakdown

### 🎯 MVP1: Trip Planning Foundation

**Status:** ✅ COMPLETE (100%)  
**Started:** January 30, 2026  
**Target:** February 15, 2026  
**Goal:** Users can plan, visualize, and manage basic trips

#### Completed Features ✅
1. ✅ User authentication (register/login)
2. ✅ User profile management
3. ✅ Trip plan generation API (`POST /trips/plan`)
4. ✅ i18n support (6 languages)
5. ✅ Render deployment

#### Completed (cont.)
- Trip edit, delete, archive, **unarchive** (CRUD + status)

#### Remaining Features 📋

None — **MVP1 is fully complete.**  
The detailed task breakdown for MVP1 now lives in `MVP1_TASK_BREAKDOWN.md` and is kept **only for historical reference** so this roadmap can stay high-level and current.

#### Definition of Done (MVP1)
- [ ] User can create a trip from plan
- [ ] User can see trip on map with markers
- [ ] User can view day-wise breakdown
- [ ] User can edit trip details and itinerary
- [ ] User can change trip status
- [ ] User can archive/delete trip
- [ ] All features work without paid services
- [ ] App is fully functional and deployable
- [ ] Documentation is up-to-date

---

### 🚀 MVP2: Collaboration & Discovery

**Status:** ✅ COMPLETE (100%)  
**Goal:** Users can share trips and collaborate  
**Started:** January 31, 2026 | **Completed:** January 31, 2026

#### Completed Features ✅
1. ✅ Multi-day Route Visualization
   - Colored polylines per day connecting itinerary stops (Day 1 blue, day 2 green, etc.)

2. ✅ Transportation Mode Selection
   - User selects: flight/train/bus on Trip Detail; trip starts from selected hub; hub highlighted

3. ✅ Public Timeline/Feed
   - GET /trips/feed, Discover (Feed) page, destination filter

4. ✅ Trip Sharing
   - Make public / Make private on Trip Detail; public trips appear on Discover feed

5. ✅ Collaborator Invitations
   - Generate one-time invite code (POST /trips/:id/invite); 24h expiry; roles: viewer, editor
   - Redeem code (POST /invite/redeem); no WhatsApp/email (MVP3+)
   - **People on trip:** GET /trips/:id returns `collaborators` array (who joined via invite). Trip Detail shows "People on this trip" (owner + collaborators) and **Remove** (owner can remove any; editors can remove viewers only). DELETE /trips/:id/collaborators/:userId to remove a collaborator.

#### Deferred to MVP3 (optional)
- **Enhanced Trip Suggestions** (scraping/community) — can add in MVP3
- **Live Location Integration** (browser Geolocation, distance to start) — fits MVP3 real-time tracking

---

### 🌟 MVP3: Real-Time Trip Execution

**Status:** ✅ COMPLETE (100%)  
**Goal:** Real-time tracking and social features  
**Prerequisites:** MVP2 complete ✅ (approved)

#### Completed Features 📋
1. ✅ Timeline Preferences (MVP3.1)
   - User profile interests and preferred destinations (Profile/Settings)
   - Feed filter by destination and interest

2. ✅ Real-time Location Tracking
   - Live user marker on map
   - Current day highlighted
   - Next location ETA
   - Delay alerts

3. ✅ In-trip Chat (MVP3.5 + 3.6)
   - Real-time messaging (polling)
   - Media upload (images) via **Cloudflare R2**; **100 MB/user** (enforced server-side)
   - **Storage: X MB / 100 MB** visible in Profile
   - Trip chat: attach image → presign → upload to R2 → post message with imageKey; images shown in chat

4. ✅ Social Features (MVP3.7 + 3.8)
   - Like trips on timeline
   - Comment on public trips
   - Share trips (Copy link on Trip Detail)

---

### 🎨 Design Optimization

**Status:** ✅ Complete (February 2026)  
**Goal:** UI/design review and polish before MVP4  
**Prerequisites:** MVP3 complete  
**Reference:** [DESIGN_OPTIMIZATION.md](DESIGN_OPTIMIZATION.md)

Design Optimization phase is complete. Next phase is **MVP4** (AI Trip Agent); start only with explicit user approval. See [MVP4_AI_AGENT.md](MVP4_AI_AGENT.md).

---

### 📱 UI Enhancement (Mobile Focus)

**Status:** 🔄 In progress  
**Goal:** Improve and enhance the UI with a focus on mobile screens. Flows are made usable, consistent, and polished on small viewports; desktop is unchanged.  
**Reference:** [UI_ENHANCEMENT_MOBILE.md](UI_ENHANCEMENT_MOBILE.md)

#### Scope
- **Focus:** Mobile viewports (e.g. ≤900px, small phones ≤480px).
- **Approach:** One flow at a time; mobile-only CSS/layout where possible; document completed and next flows.

#### Completed ✅
- **Login & Register:** Mobile layout/alignment (covered in earlier design passes).
- **Trip creation flow (Home):**
  - Plan with AI and Draft itinerary sections: full-height min on mobile (`100vh - header - tabbar - padding`).
  - Map moved inside draft itinerary (before days); sidebar and Trending hidden on mobile; single scroll for header + map + days.
  - Regenerate / Edit day: icon-only buttons on mobile (~30% smaller, no border).
  - App bar: Waypoint logo vertically centered on mobile.

#### Next 📋
- **Trip view (Trip Detail):** Mobile layout, map, chat FAB, headers.
- **Edit trip:** Removed (AI chat–based edit in MVP4+ AI Capability Enhancements).
- **Other flows:** Discover (Feed), Profile, My Trips, Gallery, as needed.

---

### 🔧 Improvements Phase

**Status:** ✅ Implemented (February 2026)  
**Goal:** UX, performance, and architecture improvements identified from app review.

#### Completed ✅

1. **Drag-and-drop itinerary reorder**
   - **@dnd-kit/core** used on Home page: draggable itinerary items and droppable slots (Morning/Afternoon/Evening). Users can drag an activity from one slot or day to another; `handleMoveItineraryItem` updates the plan and recalculates slot/day hours.
   - Component: `apps/frontend/src/components/ItineraryDnd.jsx`; drag handle on each item when not in edit mode.

2. **Map marker clutter / active-day filtering**
   - **MapView** accepts optional `activeDayIndex`. When set, only that day's markers and route polyline are shown. Trip Detail page has a "Show on map" dropdown (All days | Day 1 | Day 2 …) in the map header when the trip has multiple days.
   - Markers are tagged with `dayIndex` when built in TripDetail so filtering works.

3. **Offline mode / PWA**
   - **vite-plugin-pwa** added: Web App Manifest (name, short_name, theme_color, icons), Service Worker with `autoUpdate`, and Workbox runtime caching for OSM map tiles (CacheFirst, 30-day expiry).
   - Config: `apps/frontend/vite.config.js`. Build outputs `sw.js` and `manifest.webmanifest`.

4. **Notifications (in-app bell)**
   - **NotificationBell** in site header (SiteLayout): badge count, dropdown with list, "Mark all read". Store: `apps/frontend/src/stores/notifications.js` (Zustand). Notifications can be added via `useNotificationStore.getState().add({ title, subtitle, link })`; backend/push can be added later.

5. **State management (Zustand)**
   - **useTripDetailStore** (`apps/frontend/src/stores/tripDetailStore.js`): holds `trip`, `activeMapDay`, and `reset`. Trip Detail page uses it for map day filter and syncs trip to the store so child components can read without prop-drilling.
   - Notifications use the same Zustand store pattern.

#### Browser verification checklist

- **DnD:** Log in → Home → create a plan (e.g. "3 days in Paris") → when itinerary appears, drag an activity by the grip handle to another time slot or day; list and map should update.
- **Map filter:** Open a trip with multiple days → on the map section, use "Show on map" dropdown → choose "Day 2"; only Day 2 markers and route should show.
- **PWA:** Run `npm run build` in apps/frontend → serve dist (e.g. `npx serve dist`) → in DevTools Application tab, confirm Manifest and Service Worker; reload offline to test cache.
- **Notifications:** In the header, click the bell icon → panel opens with "No notifications yet."; add one via console: `window.__NOTIFICATION_ADD?.({ title: 'Test', subtitle: 'Test notification' })` or from code using `useNotificationStore.getState().add({ title: 'Test' })`.
- **Zustand:** Trip Detail map day filter and trip data are driven by `useTripDetailStore`; no functional change visible beyond the map filter UI.

---

### 🗄️ Database Migration (MongoDB) — Optional Before MVP4/MVP5

**Status:** ✅ Complete  
**Goal:** Replace file-based storage with MongoDB so the app has persistent, scalable data.  
**Reference:** [MONGODB_SETUP.md](MONGODB_SETUP.md)

#### Scope
- **Storage:** When `MONGODB_URI` is set, backend uses MongoDB (Atlas); otherwise falls back to file-based JSON (local dev).
- **Collections:** `users` (id, email, passwordHash, profile, createdAt); `trips` (full trip document with `userId` as owner). Same API surface; only the persistence layer changes.
- **Migration:** Optional script `apps/backend/scripts/migrate-file-to-mongo.js` imports existing `data/users.json` into MongoDB (see MONGODB_SETUP.md).

#### Completed ✅
- MongoDB driver and `lib/db.js` (connect, readUsers, writeUsers) implemented; users and trips fully supported.
- Server uses MongoDB when `MONGODB_URI` is set; file-based fallback when not set.
- Dev user seeding works with both backends.
- Migration script: `node apps/backend/scripts/migrate-file-to-mongo.js` (from repo root).
- Documentation: MONGODB_SETUP.md, MVP_ROADMAP, APP_ARCHITECTURE, DEVELOPMENT_STATUS updated.

#### Your part (to use MongoDB)
1. Create a MongoDB Atlas cluster (free M0 tier).
2. Get the connection string and set `MONGODB_URI` in local `.env` (or `.env.development`) and in Render (backend service) environment.
3. (Optional) Run the migration script once to import existing file data: `node apps/backend/scripts/migrate-file-to-mongo.js`.

---

### 🤖 MVP4: AI Trip Agent

**Status:** ✅ COMPLETE  
**Goal:** Users create and edit trips by chatting with an AI agent; any destination/pace/days; AI returns data in the same format as existing trip plan for seamless integration.  
**Reference:** [MVP4_AI_AGENT.md](MVP4_AI_AGENT.md)

**Note:** Provider-agnostic adapter pattern. Set `GEMINI_API_KEY` and/or `GROQ_API_KEY` in backend; free-tier providers supported. Without keys, users see a clear message and get static planner fallback.

#### Completed Features ✅
1. ✅ Backend adapter: `lib/tripAgent.js` (Gemini, Groq); env-based keys; fallback to static planner when AI unavailable or no keys.
2. ✅ Chat endpoint: `POST /trips/agent/chat` — messages + context (destination, days, pace, currentItinerary); returns plan (same shape as `POST /trips/plan`) plus `assistantMessage`, `aiUnconfigured`, `agentUnavailable`.
3. ✅ Frontend (Home): after destination/pace/days, AI chat with "Start over"; AI replies and itinerary preview; create trip from AI-generated plan.
4. ✅ Frontend (Trip Detail): AI chat FAB for itinerary edits; same chat API and plan response.
5. ✅ Static plan flow unchanged; AI is an alternative path.

---

### 🤖 MVP4+ AI Capability Enhancements

**Status:** 🔄 In progress (trip creation enhancements)  
**Goal:** Richer AI-driven trip creation, editing, and ongoing-trip insights.  
**Prerequisites:** MVP4 (AI Trip Agent) complete.  
**Branch:** `dev_ai_enhancements` for current work.

#### 1. Trip creation enhancements (AI) — in progress

- **Gather-before-plan:** The agent no longer suggests an itinerary until it has **destination**, **days** (1–10), and **pace** (relaxed/balanced/fast). When the user types only a destination (e.g. "Armenia"), the AI asks for days and pace conversationally; response includes **`contextIncomplete: true`** and **`suggestedContext`** so the client can merge and continue the flow.
- **Conversational flow:** Backend runs a dedicated "gather" step (Groq/Gemini when keys set, or simple parsing when no keys) so the chat is engaging and asks for missing info instead of generating a generic plan.
- **Proper AI use:** With `GEMINI_API_KEY` and/or `GROQ_API_KEY` set, the gather step and plan generation both use the configured adapters.
- **Reference:** `apps/backend/lib/tripAgentGather.js`, `tripAgentHandler.js`; API response fields `contextIncomplete`, `suggestedContext` (see API_REFERENCE.md).

#### 2. Trip edit / ongoing trip AI enhancements — in progress

- **AI chat–based edit trip:** Edit is implemented via the Trip Detail AI panel (Plan with AI). Backend skips the gather step when context has `currentItinerary` + full destination/days/pace (edit mode). AI prompt includes edit instructions (add/remove day, add activity, change pace) and the current itinerary for modification.
- **Robustness:** Trip Detail does not call `updateTrip` when the API returns `contextIncomplete` or when the response has no valid itinerary; user sees the assistant message only. Valid itinerary is required (array, length ≥ 1, each day has slots) before persisting.
- **UX:** "Applying changes…" and "Trip updated with your changes." notices; i18n keys added. Playwright script: `scripts/playwright-edit-trip.mjs`; browser checklist updated (MVP1_BROWSER_TEST_CHECKLIST.md). See `docs/AI_EDIT_TRIP_GOALS.md` for the full 10-round goal list and status.  
   - AI assistance when editing an existing trip or during an active trip.  
   - **Rich AI insights section on Trip Detail:** Replace or augment the simple title with feature-rich insights, e.g.:
     - "Hey, your trip is starting in 4 days"
     - "You have 1 prerequisite which is not fulfilled yet"
     - Other contextual, trip-specific insights (dates, checklist, weather, etc.)  
   - This will build on the current collapsible AI section (accordion) and the "Plan with AI" chat panel.

**Current behavior (no change in this phase):** The Trip Detail AI section shows a simple insight-style title (e.g. "Your trip to Paris · AI insights"), is collapsible, and opens the existing AI chat panel on tap. **Edit trip:** The form-based "Edit trip" (trip name, destination, days) has been removed; trip editing will be delivered as AI chat–based edit in the MVP4+ AI Capability Enhancements phase.

---

### 💼 MVP5: Marketplace Integration

**Status:** ⏸️ NOT STARTED  
**Goal:** Real pricing and booking options  
**Prerequisites:** MVP4 (AI Trip Agent) complete + user approval to start MVP5  
**Note:** This phase introduces PAID services (Skyscanner, accommodation APIs)

#### Planned Features 📋
1. ⏳ Transport Pricing
   - Skyscanner API integration
   - Real-time flight/train/bus prices
   - Comparison view

2. ⏳ Accommodation Suggestions
   - Hotel API integration (Booking.com, Expedia)
   - Price ranges
   - Location filtering

---

### 🏢 MVP6: Enterprise Features

**Status:** ⏸️ NOT STARTED  
**Goal:** Travel agency templates  
**Prerequisites:** MVP5 complete + user approval

#### Planned Features 📋
1. ⏳ Agency Templates
   - Agencies can create trip templates
   - Users can request to join
   - Template marketplace

---

## Progress Tracking

### Overall Completion

| Phase | Status | Progress | Target Date |
|-------|--------|----------|-------------|
| MVP1 | ✅ Complete | 100% | Feb 15, 2026 |
| MVP2 | ✅ Complete | 100% | Jan 31, 2026 |
| MVP3 | ✅ Complete | 100% | Feb 2026 |
| Design Optimization | ✅ Complete | — | Feb 2026 |
| **UI Enhancement (Mobile)** | 🔄 In progress | — | Ongoing |
| **Improvements** | ✅ Complete | 100% | Feb 2026 |
| MVP4 (AI Trip Agent) | ✅ Complete | 100% | Feb 2026 |
| **MVP4+ AI Capability Enhancements** | ⏸️ Not Started | 0% | After approval |
| MVP5 (Marketplace) | ⏸️ Not Started | 0% | After approval |
| MVP6 (Enterprise) | ⏸️ Not Started | 0% | TBD |

### Additional Features (Between MVP3 and MVP4)

| Feature | Summary | Status |
|--------|---------|--------|
| **Prerequisites** | Trip checklist: add/assign/mark done by collaborators; public view read-only. See [ADDITIONAL_FEATURES.md](ADDITIONAL_FEATURES.md). | ✅ Complete |
| **MongoDB** | Optional DB: `lib/db.js` (users + trips); migration script `scripts/migrate-file-to-mongo.js`. See [MONGODB_SETUP.md](MONGODB_SETUP.md). | ✅ Complete |

### Current Phase: UI Enhancement (mobile) + MVP5 when approved

**Overall:** MVP1–MVP4 complete. **UI Enhancement (Mobile)** in progress: login, register, trip creation done; next trip view, edit. MVP5 (Marketplace) starts only with explicit approval.

| Phase | Summary | Status |
|-------|---------|--------|
| MVP1 | Auth, profile, trip CRUD, map, day-wise view, edit, archive/unarchive, transport hubs | ✅ 100% |
| MVP2 | Route lines, transport mode, feed, trip sharing, invite codes, collaborators | ✅ 100% |
| MVP3 | Timeline prefs, real-time location, live map, ETA, chat (R2, 100MB/user), like/comment, share, gallery, thumbnails | ✅ 100% |
| Design Optimization | UI/design review; one change per feedback item | ✅ Complete |
| **UI Enhancement (Mobile)** | Mobile-first UI polish; login, register, trip creation done; next: trip view, edit. See UI_ENHANCEMENT_MOBILE.md | 🔄 In progress |
| **Improvements** | DnD reorder, map clutter/PWA, notifications, Zustand. See Improvements Phase section. | ✅ Complete |
| Additional: Prerequisites | Trip prerequisites list; assign/mark done when trip active | ✅ Complete |
| MVP4 | AI Trip Agent: chat-based trip create/edit; Gemini + Groq adapters; Home + Trip Detail AI section; see MVP4_AI_AGENT.md | ✅ Complete |
| MVP4+ AI Enhancements | Trip creation AI enhancements; trip edit/ongoing AI; rich AI insights section (e.g. "trip in X days", "N prerequisites not done") — not started | ⏸️ Future |

---

## Development Guidelines

### Before Starting a Feature
1. ✅ Confirm it's in current MVP phase
2. ✅ Check zero-cost constraint
3. ✅ Break into atomic tasks
4. ✅ Plan testing strategy

### During Development
1. ✅ Keep app working (feature flags if needed)
2. ✅ Test after each commit
3. ✅ Update docs in same commit
4. ✅ Use dev user for testing

### Before Marking Complete
1. ✅ All tasks checked off
2. ✅ Full feature tested end-to-end
3. ✅ No console errors
4. ✅ Documentation updated
5. ✅ Deployed to Render
6. ✅ Production testing done

---

## Decision Log

### January 30, 2026
- ✅ Decided to use Leaflet.js for maps (free, open-source)
- ✅ Decided to use file-based storage for MVP1 (file /tmp or data/users.json)
- ✅ Decided to use Nominatim for geocoding (free, OSM)
- ✅ Decided against Google Maps API (paid, over-budget for MVP1)

### January 31, 2026
- 📝 Created MVP roadmap with atomic task breakdown
- 📝 Established transactional development principle
- 📝 Set up Cursor rules for scope discipline
- 🧹 Removed redundant documentation summaries and setup/deploy notes

### February 3, 2026
- 📝 **MVP3 media storage:** Cloudflare R2 approved for in-trip chat media uploads
- 📝 **Per-user limit:** 100 MB per user (enforced server-side)
- 📝 **Visibility:** Storage usage (e.g. X MB / 100 MB) shown in Profile or Settings; implement as tasks progress

### February 6, 2026 (MVP3 fixes)
- ✅ **Trip Gallery:** Comment section implemented as toggleable sidebar (same pattern as Trip Detail); full-height layout so sidebar occupies space consistently.
- ✅ **Trip Gallery:** Image viewer uses full available height; thumbnail strip fixed to bottom; zoom + pan supported.
- ✅ **Trip Gallery:** Page structure aligned with Trip Detail (layout outside container, full viewport height on desktop).

---

## Risk Management

### Known Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ephemeral file storage (e.g. Render /tmp) | Data loss on redeployment | Document limitation; use MongoDB or persistent storage for production |
| Free API rate limits | Service degradation | Implement caching, fallback to mock data |
| Map performance | Slow rendering with many markers | Limit markers, add clustering in MVP2 |
| Scope creep | Delayed delivery | Strict Cursor rules, explicit approval required |

---

## Success Criteria

### MVP1 Success
- ✅ User can plan a complete trip without leaving the app
- ✅ Trip visualization is clear and intuitive
- ✅ All features work on mobile and desktop
- ✅ Zero crashes or critical bugs
- ✅ App remains demo-ready throughout development

### Long-term Success
- 🎯 1000+ registered users
- 🎯 500+ public trips shared
- 🎯 Active collaboration on 100+ trips
- 🎯 Positive user feedback on UX

---

## Next Steps

### Immediate (now)
1. **Choose next focus:** MVP5 (Marketplace) when approved; or configure R2 for image uploads; or MongoDB for persistent storage. See [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) “What’s next.”
2. **Database migration (optional):** Complete MongoDB setup (see [MONGODB_SETUP.md](MONGODB_SETUP.md)): create Atlas cluster, set `MONGODB_URI`, optionally run migration script. Backend already supports MongoDB when `MONGODB_URI` is set.
3. **R2 (optional):** Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` and bucket CORS so trip/gallery/chat image uploads work (see [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)).

### When you approve MVP4 (AI Trip Agent)
1. Follow [MVP4_AI_AGENT.md](MVP4_AI_AGENT.md) for task breakdown and implementation.
2. Provide API keys (e.g. Gemini, Groq, or OpenRouter) after implementation; free-tier providers supported.
3. Start MVP4 only after explicit approval. Do not start MVP5 until MVP4 is complete.

### After MVP4 (when you approve MVP5)
1. Create MVP5 task breakdown (transport pricing, accommodation suggestions).
2. Confirm budget and paid services (Skyscanner, accommodation APIs).

### Design Optimization complete
- UI redesign phase finished (February 2026). MVP4 (AI Trip Agent) is next; MVP5/MVP6 after that.

---

**Maintained By:** TripMaker Development Team  
**Next Review:** When MVP4 (AI Trip Agent) is approved or when phase status changes. Documentation aligned as of February 7, 2026 (MVP4 = AI Trip Agent; MVP5 = Marketplace; MVP6 = Enterprise).
