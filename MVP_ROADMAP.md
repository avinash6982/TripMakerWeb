# 🗺️ TripMaker MVP Roadmap

**Last Updated:** February 2026  
**Current Phase:** Design Optimization (post-MVP3)  
**Overall Progress:** MVP1 100%; MVP2 100%; MVP3 100%; Design Optimization active; MVP4 not started

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
- Vercel free tier hosting
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
5. ✅ Vercel deployment

#### Completed (cont.)
- Trip edit, delete, archive, **unarchive** (CRUD + status)

#### Remaining Features 📋
None (MVP1 complete).
1. ✅ **Trip Creation & Persistence** (complete)
   - Data model: Trip → User relationship
   - API: POST /trips (create), GET /trips (list), GET /trips/:id (get)
   - Vercel: api/trips/index.js (GET + POST), api/trips/[id].js (GET)
   - Frontend: Save Trip UI on Home, Trips list page, Trip detail page
   - Tasks:
     - [x] Define Trip data model
     - [x] POST /trips (backend + Vercel)
     - [x] GET /trips (backend + Vercel)
     - [x] GET /trips/:id (backend + Vercel)
     - [x] PUT /trips/:id (update)
     - [x] DELETE /trips/:id (delete)
     - [x] PATCH /trips/:id/archive
     - [x] PATCH /trips/:id/unarchive
     - [x] API_REFERENCE.md updated

2. ✅ **Map Visualization** (complete)
   - Integrate Leaflet.js (free, open-source)
   - Display destination as center marker (red)
   - Show itinerary locations as markers (blue, geocoded with Nominatim)
   - Tasks:
     - [x] Install react-leaflet dependencies
     - [x] Create MapView component
     - [x] Fetch destination coordinates (Nominatim API)
     - [x] Render destination marker
     - [x] Render itinerary item markers
     - [x] Add marker popups with location details
     - [x] Style map container

3. ⏳ **Day-wise Itinerary View**
   - Timeline-style day breakdown
   - Show activities per time slot (morning/afternoon/evening)
   - Display duration and category
   - Tasks:
     - [ ] Create ItineraryView component
     - [ ] Create DayCard component
     - [ ] Create TimeSlot component
     - [ ] Create ActivityItem component
     - [ ] Add responsive styling
     - [ ] Add expand/collapse functionality

4. ⏳ **Trip Editing**
   - Modify trip name, dates
   - Add/remove itinerary items
   - Reorder activities
   - Regenerate itinerary (call /trips/plan again)
   - Tasks:
     - [ ] Create TripEditor component
     - [ ] Add inline editing for trip fields
     - [ ] Add drag-and-drop for reordering (optional: use simple up/down buttons)
     - [ ] Add "Add activity" button
     - [ ] Add "Remove activity" button
     - [ ] Add "Regenerate itinerary" button
     - [ ] Update PUT /api/trips/:id to handle changes

5. ⏳ **Trip Status Management**
   - Status: planning → active → completed → archived
   - Status badges and filters
   - Archive/delete trip actions
   - Tasks:
     - [ ] Add status field to Trip model
     - [ ] Create status update UI (dropdown/buttons)
     - [ ] Implement status filter on trip list
     - [ ] Add "Archive" button
     - [ ] Add "Mark as complete" button
     - [ ] Add "Delete" confirmation dialog
     - [ ] Add status badges with colors

6. ⏳ **Transportation Hub Integration (Mock)**
   - Show nearest bus/train/airport to destination
   - Display distances from city center
   - Use static/mock data (no API calls)
   - Tasks:
     - [ ] Create mock data for major city hubs
     - [ ] Add hub markers to map (different icon)
     - [ ] Show hub distances in UI
     - [ ] Add "Transportation" section to trip view

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

### 🌟 MVP3: Advanced Features

**Status:** 🔄 READY TO START  
**Goal:** Real-time tracking and social features  
**Prerequisites:** MVP2 complete ✅ (approved)

#### Planned Features 📋
1. ✅ Timeline Preferences (MVP3.1)
   - User profile interests and preferred destinations (Profile/Settings)
   - Feed filter by destination and interest

2. ⏳ Real-time Location Tracking
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

### 🎨 Design Optimization (current)

**Status:** 🔄 Active  
**Goal:** UI/design review and polish before MVP4  
**Prerequisites:** MVP3 complete  
**Reference:** [DESIGN_OPTIMIZATION.md](DESIGN_OPTIMIZATION.md), `.cursor/rules/design-optimization-phase.mdc`

This is a **feedback-driven** stage: you review design elements, page structure, styles, and overall UI and provide specific feedback. Each change is applied **in isolation** (one item at a time) to avoid regressions. No new features; no MVP4 work until you acknowledge this phase complete.

---

### 💼 MVP4: Marketplace Integration

**Status:** ⏸️ NOT STARTED  
**Goal:** Real pricing and booking options  
**Prerequisites:** Design Optimization acknowledged complete + user approval to start MVP4  
**Note:** This phase introduces PAID services

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

### 🏢 MVP5: Enterprise Features

**Status:** ⏸️ NOT STARTED  
**Goal:** Travel agency templates  
**Prerequisites:** MVP4 complete + user approval

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
| Design Optimization | 🔄 Active | — | User-driven |
| MVP4 | ⏸️ Not Started | 0% | After design phase |
| MVP5 | ⏸️ Not Started | 0% | TBD |

### Current Phase: Design Optimization

**Overall:** MVP1–MVP3 complete; Design Optimization active (feedback-driven UI/design polish).

| Phase | Summary | Status |
|-------|---------|--------|
| MVP1 | Auth, profile, trip CRUD, map, day-wise view, edit, archive/unarchive, transport hubs | ✅ 100% |
| MVP2 | Route lines, transport mode, feed, trip sharing, invite codes, collaborators | ✅ 100% |
| MVP3 | Timeline prefs, real-time location, live map, ETA, chat (R2, 100MB/user), like/comment, share, gallery, thumbnails | ✅ 100% |
| Design Optimization | UI/design review; one change per feedback item; no MVP4 | 🔄 Active |

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
5. ✅ Deployed to Vercel
6. ✅ Production testing done

---

## Decision Log

### January 30, 2026
- ✅ Decided to use Leaflet.js for maps (free, open-source)
- ✅ Decided to use file-based storage for MVP1 (Vercel /tmp)
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

---

## Risk Management

### Known Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ephemeral Vercel storage | Data loss on redeployment | Document limitation, plan DB migration for MVP2 |
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

### Immediate (MVP3)
1. Define MVP3 task breakdown (timeline prefs, real-time location, live map, ETA, chat, like/comment, share)
2. Start with P0: real-time location tracking + live map with current location
3. Then: in-trip chat, like/comment on feed, share externally

### Deferred from MVP2 (optional in MVP3)
- Enhanced trip suggestions (scraping/community)
- Live location integration (browser Geolocation, distance to start)

---

**Maintained By:** TripMaker Development Team  
**Next Review:** February 7, 2026 (mid-MVP1 checkpoint)
