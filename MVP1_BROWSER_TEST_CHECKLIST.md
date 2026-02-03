# MVP1 Browser Test Checklist

**Last Updated:** January 31, 2026  
**Purpose:** Manual browser verification of all MVP1 features (1.1–1.13).  
**MVP2:** See `MVP2_QA_CHECKLIST.md` for Discover feed, multi-day routes, sharing, and invite.

**Prerequisites:** Backend and frontend running (`npm run dev`).  
**Test user:** `dev@tripmaker.com` / `DevUser123!`

**Important:** After testing trip actions (Archive, Mark complete, Delete), confirm **no CORS errors** in the Console and **no "Failed to fetch"** on the page. If you see either, the backend CORS `methods` must include `PATCH` (and any other methods used by trip endpoints).

---

## 1. Auth & Profile

- [ ] **Login:** Go to http://localhost:5173 → Log in with dev user → Redirects to Home
- [ ] **Profile:** Nav → Profile → Page loads, form shows email/phone/country/language/currency
- [ ] **Profile save:** Change a field → Save changes → Success message
- [ ] **Logout:** Log out → Redirects to login

---

## 2. Trip Planning (Home)

- [ ] **1.1–1.2:** Enter destination (e.g. Paris), days (3), pace (Balanced) → Generate plan → Itinerary appears
- [ ] **1.3:** Map preview shows with red destination marker; blue itinerary markers appear (after geocoding)
- [ ] **1.4:** Day-wise timeline: Day 1, Day 2, Day 3 with morning/afternoon/evening slots
- [ ] **1.5:** Click "Edit day" on a day → Inline edit activity names (type multiple characters; input must not reset after each keystroke) → "Done editing"
- [ ] **1.5 Place suggestions:** While editing an activity, typing shows place suggestions (datalist) for the destination; can select or type freely
- [ ] **1.13:** Destination suggestions (datalist) show Paris, Tokyo, New York

---

## 3. Save Trip (1.6)

- [ ] After generating a plan → Click **Save trip** → Modal opens
- [ ] Enter trip name (e.g. "Paris weekend") → Save trip → Success message
- [ ] Click **View my trips** → Redirects to My Trips list

---

## 4. My Trips List (1.7)

- [ ] **My Trips** in nav → List of saved trips (cards with name, destination, days, status, date)
- [ ] **Create new trip** → Redirects to Home
- [ ] **View** on a card → Opens trip detail page

---

## 5. Trip Detail & Actions (1.8–1.11)

- [ ] **Trip detail:** Name, destination, days, status badge, full itinerary
- [ ] **1.8 Edit:** Click Edit → Change name/destination/days → Save changes → Trip updates
- [ ] **1.11 Mark complete:** Click "Mark complete" → Status becomes Completed; no "Failed to fetch"; no CORS errors in Console
- [ ] **1.10 Archive:** Click Archive → Status becomes Archived; success message shown (not "Failed to fetch"); no CORS errors in Console
- [ ] **Unarchive:** On an archived trip → Click **Unarchive** → Status becomes Upcoming; success message shown; no CORS errors
- [ ] **1.9 Delete:** Click Delete → Confirmation modal → Confirm → Redirects to My Trips; trip removed; no CORS errors in Console

**CORS check:** Open DevTools → Console. After Archive / Mark complete / Delete, ensure there are no `Access-Control-Allow-Methods` or CORS preflight errors. Backend must allow `GET`, `POST`, `PUT`, `PATCH`, `DELETE` in CORS config.

---

## 6. Show Archived (1.10)

- [ ] On My Trips → Click **Show archived** → Archived trips appear in list
- [ ] Click **Hide archived** → Archived trips hidden again

---

## 7. Transport Hubs (1.12)

- [ ] Open a trip with destination Paris, Tokyo, or New York City
- [ ] **Transportation** section shows: Nearest airport, nearest train, nearest bus (mock data)

---

## 8. Quick Smoke

- [ ] No console errors on Login, Home, Profile, My Trips, Trip Detail
- [ ] No CORS errors in Console when using trip actions (Archive, Mark complete, Delete, Edit, Save)
- [ ] Network: Profile and trips APIs return 200 (no repeated profile calls on Profile page)
- [ ] Trip Detail: No "Failed to fetch" after Archive or Mark complete

---

## 9. Trip Actions Deep Check (recommended before release)

Run with DevTools open (Console + Network).

1. **Archive:** Open a trip → Click Archive → Verify: status badge shows "Archived", no red "Failed to fetch", Console has no CORS/preflight errors, Network shows `PATCH .../trips/:id/archive` with status 200.
2. **Mark complete:** Open a trip → Click Mark complete → Verify: status shows "Completed", no "Failed to fetch", Console clean, Network shows `PUT .../trips/:id` with 200.
3. **Delete:** Open a trip → Click Delete → Confirm → Verify: redirect to My Trips, trip no longer in list, Network shows `DELETE .../trips/:id` with 200.
4. **Show archived:** My Trips → "Show archived" → Archived trip(s) visible; "Hide archived" hides them.
5. **Unarchive:** Open an archived trip → Click **Unarchive** → Status becomes Upcoming; trip appears in main list when "Hide archived" is on.

---

**Run this checklist after any change to auth, trips, or profile flows.**
