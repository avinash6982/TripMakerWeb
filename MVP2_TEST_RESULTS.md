# MVP2 Sanity & Test Results

**Date:** January 31, 2026  
**Environment:** Local (backend: localhost:3000, frontend: localhost:5173)

---

## API Sanity Tests (Automated)

**Script:** `node test-mvp2-sanity.js`  
**Run:** `npm run dev` (backend + frontend), then `node test-mvp2-sanity.js`

### Test Coverage

| # | Test | Result |
|---|------|--------|
| 1 | Health check | ✅ PASS |
| 2 | Register User A (inviter) | ✅ PASS |
| 3 | Register User B (invitee) | ✅ PASS |
| 4 | User A creates trip | ✅ PASS |
| 5 | User A creates invite (editor role) | ✅ PASS |
| 6 | User B trips before redeem (0) | ✅ PASS |
| 7 | User B redeems invite code | ✅ PASS |
| 8 | User B sees collaborated trip in list | ✅ PASS |
| 9 | User B can GET trip by ID (collaborator) | ✅ PASS |
| 10 | User B (editor) can PUT/update trip | ✅ PASS |
| 11 | Public feed returns trips (no auth) | ✅ PASS |
| 12 | Transport mode set on trip | ✅ PASS |
| 13 | Editor cannot DELETE (returns 403) | ✅ PASS |
| 14 | Invalid invite code returns error | ✅ PASS |
| 15 | User C (viewer) redeems invite | ✅ PASS |
| 16 | Viewer cannot update (returns 403) | ✅ PASS |

**All 16 API sanity tests passed.**

---

## Manual Browser Test Checklist

### Prerequisites
- `npm run dev` (backend + frontend running)
- Use unique emails for each user (or logout between tests)

### 1. Auth & Registration

- [ ] **Login (dev user):** `dev@tripmaker.com` / `DevUser123!` → redirects to /home
- [ ] **Register new user:** /register → enter email + password → redirects to /home
- [ ] **Logout:** Click "Log out" → redirects to /login

### 2. Trip Creation & Planning

- [ ] **Generate plan:** Home → enter "Paris", 3 days, balanced → Generate plan
- [ ] **Plan appears:** Day-wise itinerary with morning/afternoon/evening slots
- [ ] **Map loads:** Map preview with destination marker + itinerary markers
- [ ] **Day routes:** Colored polylines per day (blue day 1, green day 2, etc.)
- [ ] **Save trip:** Click "Save trip" → enter name → trip saved
- [ ] **Edit activity:** Edit day → change place name → datalist shows suggestions
- [ ] **Generic suggestions:** For non-Paris/Tokyo/NYC destination, datalist shows City Center, Old Town, etc.

### 3. Transport Mode & Make Public

- [ ] **My Trips:** Nav → My Trips → see saved trips
- [ ] **Open trip:** Click View on a trip
- [ ] **Transport mode:** Click Flight/Train/Bus chip → hub highlighted, persists
- [ ] **Make public:** Click "Make public" → success message
- [ ] **Discover:** Nav → Discover → see public trips
- [ ] **Filter:** Enter destination in filter → Filter → results update

### 4. Invite Flow (Multi-User)

**User A (Inviter):**
1. [ ] Register or login as User A (e.g. `inviter@test.com`)
2. [ ] Create a trip or open existing trip
3. [ ] Click "Invite"
4. [ ] Select role: Viewer or Editor
5. [ ] Click "Create invite code"
6. [ ] Copy the 8-character code
7. [ ] Click "Copy code" → verify code copied

**User B (Invitee):**
1. [ ] Logout User A
2. [ ] Register or login as User B (e.g. `invitee@test.com`)
3. [ ] Go to My Trips
4. [ ] Click "Redeem code"
5. [ ] Enter the code from User A
6. [ ] Click "Redeem code"
7. [ ] Verify: trip appears in list, redirects to trip detail
8. [ ] **If Editor:** Edit, Archive, Make public work; Delete and Invite hidden
9. [ ] **If Viewer:** No Edit/Archive/Make public/Delete/Invite; can view only

### 5. Public Trip Viewing

- [ ] **View public trip (logged in):** Discover → View on trip → opens trip (read-only if not owner)
- [ ] **Owner badge:** Non-owner sees "by owner@email.com"
- [ ] **Owner actions hidden:** Edit, Delete, Invite, etc. not shown for non-owners

### 6. Collaborator Access

- [ ] **Editor:** Can edit trip name, itinerary, transport mode, make public, archive
- [ ] **Editor cannot:** Delete trip, create invites
- [ ] **Viewer:** Can only view trip; no edit actions

---

## Known Limitations

1. **File-based storage:** Users and trips stored in JSON file; ephemeral on Vercel /tmp
2. **Single dev user:** `dev@tripmaker.com` auto-seeded; use registration for multi-user tests
3. **Nominatim rate limit:** Geocoding ~1 req/sec; map markers load gradually

---

## Backend Fix Applied During Testing

- **DELETE /trips/:id:** Added 403 response when collaborator (editor/viewer) attempts delete. Previously returned 404; now explicitly returns "Only the owner can delete this trip."

---

**Last run:** January 31, 2026  
**All automated API tests:** PASS
