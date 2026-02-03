# MVP2 Browser & QA Checklist

**Last Updated:** January 31, 2026  
**Purpose:** Manual verification of MVP2 features (multi-day routes, Feed, sharing, invite) and quality gates.

**Prerequisites:** Backend and frontend running (`npm run dev`).  
**Test user:** `dev@tripmaker.com` / `DevUser123!`

---

## 1. Multi-day Route on Map

### Home (Plan view)
- [ ] Generate a plan (e.g. Paris, 3 days) → Wait for map to load (destination marker red)
- [ ] Wait for geocoding to complete (~1.2s per place) → **Colored polylines** appear: Day 1 blue, Day 2 green, Day 3 amber, connecting destination to places
- [ ] Each day’s route starts at the destination and connects itinerary stops in order
- [ ] Polylines are clearly visible (weight 6, opacity 0.85)

### Trip Detail (Saved trip)
- [ ] Open a saved trip that has an itinerary → **Map section** appears below the header/actions
- [ ] Map shows destination (red) and, after geocoding, **day-wise colored routes** (same colors as Home)
- [ ] Loading state shows while map/geocoding is in progress
- [ ] No console errors when opening trip detail with map

---

## 2. Discover Feed (UI & behaviour)

### Layout (desktop)
- [ ] **Discover** in nav → Feed page loads
- [ ] Header: title “Discover”, subtitle, search bar centered
- [ ] When there are public trips: **grid of cards** (3 columns on wide desktop, 2 on tablet, 1 on narrow)
- [ ] Each card: **colored hero strip** (gradient by destination), trip name, destination, meta (days, by, date), “View” CTA
- [ ] Cards have hover state (slight lift, shadow)
- [ ] Clicking a card opens trip detail

### Layout (mobile)
- [ ] Feed shows 1 column on narrow viewport
- [ ] Search bar and cards are readable and tappable
- [ ] Bottom tab bar does not cover content

### Filter & empty state
- [ ] Type a destination in search → Submit (or Enter) → Feed filters by destination (or shows empty if none)
- [ ] Search input shows the applied filter value after submit
- [ ] When no public trips: empty state message + link to My Trips

---

## 3. Trip Sharing (Make public / private)

- [ ] Open one of your trips → Click **Make public**
- [ ] Success message; trip appears on Discover feed (may need refresh or re-open Discover)
- [ ] Click **Make private** → Trip no longer appears in Discover (for other users / after refresh)

---

## 4. Transport Mode (Trip Detail)

- [ ] Open a trip (e.g. Paris) → **Transportation** section visible
- [ ] Select **Flight** / **Train** / **Bus** → Selected chip highlighted; selection persists after refresh
- [ ] Hub list shows nearest airport, train, bus (mock data)

---

## 5. Invite & Redeem (Collaborators)

- [ ] **Create invite:** Open your trip → Invite → Choose role (Viewer / Editor) → Create invite code → Code and expiry shown; Copy code works
- [ ] **Redeem (second user):** Log out; register or log in as another user → Use “Redeem code” (or go to trip with code) → Enter code → Success; trip appears in My Trips with correct role
- [ ] **Viewer:** Can view trip, cannot edit
- [ ] **Editor:** Can edit trip (e.g. change name, Make public)

---

## 6. Quality Gates (Senior QA)

### Console & network
- [ ] No console errors on: Login, Home, Trips, Trip Detail, Discover, Profile
- [ ] No CORS errors when calling feed, trip actions, invite, redeem
- [ ] Map tiles and geocoding (Nominatim) do not flood console with errors

### Responsive
- [ ] Feed: 3 cols → 2 cols → 1 col as viewport shrinks
- [ ] Trip Detail map and itinerary readable on mobile
- [ ] Bottom tab bar (mobile) does not overlap content; safe area respected

### Accessibility
- [ ] Feed: search has `aria-label`; list has `aria-label`
- [ ] Feed cards are keyboard-focusable (Link); focus visible
- [ ] Trip Detail: headings and sections in logical order

### Data & edge cases
- [ ] Discover with 0 public trips: empty state, no crash
- [ ] Trip with no itinerary: Trip Detail loads; map section may not show route (destination only or no map if no coords)
- [ ] Invalid invite code: clear error message, no crash

---

## 7. Quick smoke (MVP2)

- [ ] Login → Home → Generate plan → See map + day routes (after geocoding)
- [ ] Save trip → My Trips → Open trip → See map + day routes on Trip Detail
- [ ] Make trip public → Discover → See card in grid → Open trip
- [ ] Create invite code → Copy → (as other user) Redeem → Trip visible with correct role

---

**Run this checklist after any change to map, feed, sharing, or invite flows.**
