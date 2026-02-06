# 🗺️ TripMaker MVP Roadmap

**Last Updated:** February 2026  
**Current Phase:** Database migration (MongoDB) — before MVP4  
**Overall Progress:** MVP1 100%; MVP2 100%; MVP3 100%; Prerequisites 100%; Design Optimization complete; **DB migration in progress**; MVP4 not started (awaiting approval)

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

Design Optimization phase is complete. Next phase is **MVP4** (Marketplace Integration); start only with explicit user approval (MVP4 introduces paid services).

---

### 🗄️ Database Migration (MongoDB) — Before MVP4

**Status:** 🔄 In progress  
**Goal:** Replace file-based storage with MongoDB so the app has persistent, scalable data before MVP4 (marketplace and paid services).  
**Reference:** [MONGODB_SETUP.md](MONGODB_SETUP.md)

#### Scope
- **Storage:** When `MONGODB_URI` is set, backend uses MongoDB (Atlas); otherwise falls back to file-based JSON (local dev).
- **Collections:** `users` (id, email, passwordHash, profile, createdAt); `trips` (full trip document with `userId` as owner). Same API surface; only the persistence layer changes.
- **Migration:** Optional script to import existing `data/users.json` into MongoDB (see MONGODB_SETUP.md).

#### Completed ✅
- MongoDB driver and `lib/db.js` (connect, readUsers, writeUsers) implemented.
- Server uses MongoDB when `MONGODB_URI` is set; file-based fallback when not set.
- Dev user seeding works with both backends.
- Documentation: MONGODB_SETUP.md, MVP_ROADMAP, APP_ARCHITECTURE, DEVELOPMENT_STATUS updated.

#### Your part (required for MongoDB)
1. Create a MongoDB Atlas cluster (free M0 tier).
2. Get the connection string and set `MONGODB_URI` in local `.env` and in Render (backend service) environment.
3. (Optional) Run the migration script once to import existing file data into MongoDB.

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
| Design Optimization | ✅ Complete | — | Feb 2026 |
| MVP4 | ⏸️ Not Started | 0% | After approval |
| MVP5 | ⏸️ Not Started | 0% | TBD |

### Additional Features (Between MVP3 and MVP4)

| Feature | Summary | Status |
|--------|---------|--------|
| **Prerequisites** | Trip checklist: add/assign/mark done by collaborators; public view read-only. See [ADDITIONAL_FEATURES.md](ADDITIONAL_FEATURES.md). | ✅ Complete |

### Current Phase: Ready for MVP4

**Overall:** MVP1–MVP3, Design Optimization, and additional feature Prerequisites complete. MVP4 (Marketplace Integration) is next; start only with explicit approval.

| Phase | Summary | Status |
|-------|---------|--------|
| MVP1 | Auth, profile, trip CRUD, map, day-wise view, edit, archive/unarchive, transport hubs | ✅ 100% |
| MVP2 | Route lines, transport mode, feed, trip sharing, invite codes, collaborators | ✅ 100% |
| MVP3 | Timeline prefs, real-time location, live map, ETA, chat (R2, 100MB/user), like/comment, share, gallery, thumbnails | ✅ 100% |
| Design Optimization | UI/design review; one change per feedback item | ✅ Complete |
| Additional: Prerequisites | Trip prerequisites list; assign/mark done when trip active | ✅ Complete |

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

### February 6, 2026 (MVP3 fixes)
- ✅ **Trip Gallery:** Comment section implemented as toggleable sidebar (same pattern as Trip Detail); full-height layout so sidebar occupies space consistently.
- ✅ **Trip Gallery:** Image viewer uses full available height; thumbnail strip fixed to bottom; zoom + pan supported.
- ✅ **Trip Gallery:** Page structure aligned with Trip Detail (layout outside container, full viewport height on desktop).

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

### Immediate (now)
1. **Database migration:** Complete MongoDB setup (see [MONGODB_SETUP.md](MONGODB_SETUP.md)): create Atlas cluster, set `MONGODB_URI`, optionally run migration script. Backend already supports MongoDB when `MONGODB_URI` is set.
2. Verify app against MongoDB (register, login, trips, prerequisites, chat, gallery).

### After DB migration (when you approve MVP4)
1. Create MVP4 task breakdown (transport pricing, accommodation suggestions)
2. Confirm budget and paid services (Skyscanner, accommodation APIs)
3. Start MVP4 only after explicit approval

### Design Optimization complete
- UI redesign phase finished (February 2026). No MVP4 work until you approve.

---

**Maintained By:** TripMaker Development Team  
**Next Review:** February 7, 2026 (mid-MVP1 checkpoint)
