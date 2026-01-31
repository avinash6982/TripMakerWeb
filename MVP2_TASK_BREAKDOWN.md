# MVP2 Task Breakdown - Collaboration & Discovery

**Phase:** MVP2 - Collaboration & Community  
**Status:** 🔄 IN PROGRESS  
**Last Updated:** January 31, 2026 (kickoff)

**Prerequisites:** MVP1 100% complete (including unarchive). Zero-cost constraint: no paid APIs in MVP2.

---

## Atomic Task Principle

Every task must:
1. Be completable in 1–3 hours
2. Result in a working, testable feature
3. Include clear test criteria
4. Keep the app demo-ready
5. Be verified in browser after completion

---

## MVP2 Features (from MVP_PLAN.md)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 2.1 | Day-wise route lines on map | P1 | 📋 Planned |
| 2.2 | AI-powered suggestions (any place) | P1 | 📋 Planned |
| 2.3 | Transportation mode selection | P0 | 📋 Planned |
| 2.4 | Start from airport/station/bus | P0 | 📋 Planned |
| 2.5 | Public timeline/feed | P0 | 📋 Planned |
| 2.6 | Post trips to timeline | P0 | 📋 Planned |
| 2.7 | Invite collaborators (viewer/editor) | P1 | 📋 Planned |
| 2.8 | One-time access codes | P1 | 📋 Planned |

---

## Suggested Implementation Order

1. **2.3 / 2.4** – Transportation mode selection + start from hub (builds on existing mock transport hubs)
2. **2.1** – Day-wise route lines on map (client-side polyline from itinerary markers; free)
3. **2.5 / 2.6** – Public timeline + post trips (data model: trip `isPublic`, feed API)
4. **2.7 / 2.8** – Collaborators + one-time codes
5. **2.2** – Enhanced suggestions (static/community data; no paid AI)

---

## Phase 2.1: Transportation Mode & Start Hub (first)

**Goal:** User can choose transport mode (flight/train/bus) and trip “starts from” a hub. Uses existing mock transport hubs.

### Task 2.1.1: Trip model – transport preference (planned)
- Add optional `transportMode?: 'flight' | 'train' | 'bus'` and `startHubId?: string` to trip (or derive from destination + mode).
- Backend: allow in POST/PUT trip payload; store on trip.
- Frontend: optional step in plan or trip detail to “Start from: Airport / Train / Bus” using existing hub data.

### Task 2.1.2: UI – transport mode selection (planned)
- On Home (after plan) or Trip detail: dropdown or chips for “How are you getting there?” (Flight / Train / Bus).
- Show selected hub (from existing transportHubs.js) and distance in Transportation section.

---

## Phase 2.2: Day-wise Route Lines on Map (planned)

**Goal:** Show colored polyline(s) per day connecting itinerary stops on the map.

### Task 2.2.1: Map – polyline per day (planned)
- Use Leaflet Polyline with itinerary marker coordinates (already geocoded).
- One color per day (e.g. day 1 blue, day 2 green) or single route line.
- Client-side only; no new backend.

---

## Phase 2.3: Public Timeline & Trip Sharing (planned)

**Goal:** Trips can be made public and appear in a feed.

### Task 2.3.1: Data model – public trips (planned)
- Add `isPublic: boolean` (default false) to trip.
- API: PATCH /trips/:id (allow isPublic); GET /trips/feed (public list, optional filters).

### Task 2.3.2: Frontend – make public + feed (planned)
- Trip detail: “Make public” / “Make private” toggle.
- New route /feed or /discover: list public trips (infinite scroll later).

---

## Phase 2.4: Collaborators & One-time Codes (planned)

**Goal:** Invite others with viewer/editor role via short-lived code.

### Task 2.4.1: Backend – invite codes (planned)
- Model: invite code (tripId, role, expiresAt, code).
- POST /trips/:id/invite (generate code), POST /invite/redeem (consume code, add collaborator).

### Task 2.4.2: Frontend – share dialog + redeem (planned)
- Trip detail: “Invite” opens dialog, copy code, expiry countdown.
- New page or modal: “Have a code?” redeem flow.

---

## Next Steps

1. **Pick first scope:** Start with **2.3 + 2.4** (transport mode + start hub) or **2.1** (route lines), per product priority.
2. **Break into atomic tasks:** Each phase above to be expanded with acceptance criteria and test steps.
3. **Browser verification:** After each task, run relevant flows; add MVP2 steps to browser checklist when new pages/flows exist.

---

**Maintained by:** Development team  
**See also:** MVP_PLAN.md (MVP2 features), MVP_ROADMAP.md, .cursor/rules/mvp-development-discipline.mdc
