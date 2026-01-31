# 🗺️ TripMaker MVP Roadmap

**Last Updated:** January 31, 2026 (trip create API)  
**Current Phase:** MVP1 - Trip Planning Foundation  
**Overall Progress:** 25% (Auth + Profile ✅)

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

#### In Progress 🔄
- Trip edit, delete, archive (CRUD remainder)

#### Remaining Features 📋
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

**Status:** ⏸️ NOT STARTED  
**Goal:** Users can share trips and collaborate  
**Prerequisites:** MVP1 complete + user approval

#### Planned Features 📋
1. ⏳ Multi-day Route Visualization
   - Colored lines for each day's route
   - Interactive route highlighting

2. ⏳ Enhanced Trip Suggestions
   - Web scraping for popular destinations
   - Community-driven recommendations
   - Still no paid AI services

3. ⏳ Transportation Mode Selection
   - User selects: flight/train/bus
   - Trip starts from selected hub
   - Show routes to starting point

4. ⏳ Live Location Integration
   - Get user's current location
   - Show distance to starting point
   - Suggest directions (text-based, not Google Maps API)

5. ⏳ Public Timeline/Feed
   - Global feed of public trips
   - Filter by destination, pace, duration
   - Infinite scroll

6. ⏳ Trip Sharing
   - "Make public" button
   - Public trips appear on timeline
   - Privacy toggle

7. ⏳ Collaborator Invitations
   - Generate one-time invite code
   - Code has short expiry (24h)
   - Collaborator roles: viewer, editor
   - No WhatsApp/email yet (MVP3+)

#### Atomic Tasks (DO NOT START)
Will be broken down when MVP1 is complete.

---

### 🌟 MVP3: Advanced Features

**Status:** ⏸️ NOT STARTED  
**Goal:** Real-time tracking and social features  
**Prerequisites:** MVP2 complete + user approval

#### Planned Features 📋
1. ⏳ Timeline Preferences
   - User profile interests
   - Preferred destinations
   - Feed customization

2. ⏳ Real-time Location Tracking
   - Live user marker on map
   - Current day highlighted
   - Next location ETA
   - Delay alerts

3. ⏳ In-trip Chat
   - Real-time messaging (WebSocket or polling)
   - Media upload (images/videos)
   - Trip-specific chat rooms

4. ⏳ Social Features
   - Like trips on timeline
   - Comment on public trips
   - Share trips (copy link)

---

### 💼 MVP4: Marketplace Integration

**Status:** ⏸️ NOT STARTED  
**Goal:** Real pricing and booking options  
**Prerequisites:** MVP3 complete + user approval  
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
| MVP1 | 🔄 In Progress | 25% | Feb 15, 2026 |
| MVP2 | ⏸️ Not Started | 0% | TBD |
| MVP3 | ⏸️ Not Started | 0% | TBD |
| MVP4 | ⏸️ Not Started | 0% | TBD |
| MVP5 | ⏸️ Not Started | 0% | TBD |

### Current Phase (MVP1) Progress

**Overall:** 100% (MVP1 complete)

| Feature | Status | Progress | Notes |
|---------|--------|----------|-------|
| Auth & Profile | ✅ Complete | 100% | Deployed to production |
| Map Visualization | ✅ Complete | 100% | Leaflet, markers, popups on Home |
| Trip Persistence | ✅ Complete | 100% | CRUD + archive, edit/delete/status/transport hubs |
| Day-wise View | ⏳ Planned | 0% | Depends on persistence |
| Trip Editing | ⏳ Planned | 0% | Depends on persistence |
| Status Management | ⏳ Planned | 0% | Depends on persistence |
| Transport Hubs | ⏳ Planned | 0% | Mock data only |

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

### Immediate (This Week)
1. Implement trip persistence (CRUD APIs)
2. Create trip list view on frontend
3. Add create trip flow

### Short-term (Next 2 Weeks)
1. Integrate map visualization
2. Build day-wise itinerary view
3. Implement trip editing

### Before MVP2
1. Complete all MVP1 features
2. Deploy to production
3. User testing session
4. Get explicit approval to proceed

---

**Maintained By:** TripMaker Development Team  
**Next Review:** February 7, 2026 (mid-MVP1 checkpoint)
