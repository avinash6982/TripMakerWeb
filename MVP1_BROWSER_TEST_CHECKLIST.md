# MVP1 Browser Test Checklist

**Last Updated:** January 31, 2026  
**Purpose:** Manual browser verification of all MVP1 features (1.1–1.13).

**Prerequisites:** Backend and frontend running (`npm run dev`).  
**Test user:** `dev@tripmaker.com` / `DevUser123!`

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
- [ ] **1.11 Mark complete:** Click "Mark complete" → Status becomes Completed
- [ ] **1.10 Archive:** Click Archive → Status becomes Archived; message shown
- [ ] **1.9 Delete:** Click Delete → Confirmation modal → Confirm → Redirects to My Trips; trip removed

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
- [ ] Network: Profile and trips APIs return 200 (no repeated profile calls on Profile page)

---

**Run this checklist after any change to auth, trips, or profile flows.**
