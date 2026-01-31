# MVP1 Task Breakdown - Atomic & Testable

**Phase:** MVP1 - Trip Planning Foundation  
**Status:** 🔄 IN PROGRESS  
**Last Updated:** January 31, 2026 (task 1.1.2 complete)

**Maintenance Note:** Documentation cleanup (removed redundant summaries and setup/deploy notes).

---

## Atomic Task Principle

Every task must:
1. ✅ Be completable in 1-3 hours
2. ✅ Result in a working, testable feature
3. ✅ Include clear test criteria
4. ✅ Keep the app in demo-ready state

---

## Current Sprint: Trip Persistence

### Feature 1: Trip Data Model & Storage

#### Task 1.1: Define Trip Data Model ✅
**Time:** 30 minutes  
**Branch:** `feat/trip-model`

**Implementation:**
1. Add `trips: []` to user objects (backend + serverless seed/register)
2. Define Trip schema (JSDoc) in `apps/backend/server.js`:
```javascript
{
  id: string (UUID),
  userId: string (UUID),
  name: string,
  destination: string,
  days: number (1-10),
  pace: 'relaxed' | 'balanced' | 'fast',
  status: 'upcoming' | 'active' | 'completed' | 'archived',
  itinerary: Array (from /trips/plan response),
  createdAt: string (ISO 8601),
  updatedAt: string (ISO 8601)
}
```
3. Add trip helper to normalize user records

**Test Criteria:**
- [x] User records include a `trips` array
- [x] Trip fields documented
- [x] No linter errors

**Demo Impact:** None (internal only)

---

#### Task 1.2: Create Trip Storage Utilities
**Time:** 1 hour  
**Branch:** `feat/trip-model`

**Implementation:**
1. Add to `api/lib/trips.js`:
   - `readTrips()` - Read from `/tmp/tripmaker-trips.json`
   - `writeTrips(trips)` - Write with queue (like users)
   - `getTripById(tripId)` - Find trip by ID
   - `getTripsByUserId(userId)` - Filter by user
2. Handle empty file case (return `[]`)
3. Add error handling

**Test Criteria:**
- [ ] Can create file if not exists
- [ ] Can read empty array from new file
- [ ] Can write and read back trips
- [ ] Queue prevents race conditions

**Test Command:**
```javascript
// In Node REPL or test file
const { readTrips, writeTrips } = require('./api/lib/trips');
const trips = await readTrips();
console.log(trips); // Should be []
```

**Demo Impact:** None (internal only)

---

#### Task 1.3: Create POST /api/trips Endpoint
**Time:** 1.5 hours  
**Branch:** `feat/trip-create`

**Implementation:**
1. ✅ Add `POST /trips` in `apps/backend/server.js` (local dev)
2. Create `api/trips/create.js`
3. Add authentication (JWT required)
4. Validate input:
   - destination (required, string)
   - days (optional, 1-10, default: 3)
   - pace (optional, enum, default: 'balanced')
5. Generate trip ID (UUID)
6. Call `/trips/plan` internally to get itinerary
7. Save to storage
8. Return trip object

**Test Criteria:**
- [ ] Returns 401 without JWT
- [ ] Returns 400 for missing destination
- [ ] Returns 400 for invalid days
- [ ] Returns 201 with trip object
- [ ] Trip saved to storage
- [ ] Trip has valid itinerary

**Test Command:**
```bash
# Should fail (no auth)
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -d '{"destination":"Paris"}'

# Should succeed
TOKEN="<jwt-token>"
curl -X POST http://localhost:3000/api/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination":"Paris","days":3,"pace":"balanced"}'
```

**Demo Impact:** ✅ User can create trips (backend only)

---

#### Task 1.4: Create GET /api/trips Endpoint (List)
**Time:** 45 minutes  
**Branch:** `feat/trip-create`

**Implementation:**
1. Create `api/trips/list.js`
2. Add authentication (JWT required)
3. Extract userId from JWT
4. Get user's trips from storage
5. Optional filters: `?status=planning`
6. Sort by updatedAt (newest first)
7. Return array of trips

**Test Criteria:**
- [ ] Returns 401 without JWT
- [ ] Returns empty array for new user
- [ ] Returns user's trips only (not others')
- [ ] Respects status filter
- [ ] Sorted correctly

**Test Command:**
```bash
curl http://localhost:3000/api/trips \
  -H "Authorization: Bearer $TOKEN"

# With filter
curl "http://localhost:3000/api/trips?status=planning" \
  -H "Authorization: Bearer $TOKEN"
```

**Demo Impact:** ✅ User can see their trips list

---

#### Task 1.5: Create GET /api/trips/:id Endpoint (Details)
**Time:** 30 minutes  
**Branch:** `feat/trip-create`

**Implementation:**
1. Create `api/trips/[id].js` (Vercel dynamic route)
2. Add authentication (JWT required)
3. Get trip by ID
4. Verify trip belongs to user (authorization)
5. Return trip object

**Test Criteria:**
- [ ] Returns 401 without JWT
- [ ] Returns 404 for non-existent trip
- [ ] Returns 403 for other user's trip
- [ ] Returns 200 with trip object for own trip

**Test Command:**
```bash
TRIP_ID="<trip-uuid>"
curl http://localhost:3000/api/trips/$TRIP_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Demo Impact:** ✅ User can view trip details

---

#### Task 1.6: Create Frontend Trip List Page
**Time:** 2 hours  
**Branch:** `feat/trip-ui`

**Implementation:**
1. Create `apps/frontend/src/pages/Trips.jsx`
2. Fetch trips on mount: `GET /api/trips`
3. Display as cards:
   - Destination
   - Days
   - Status badge
   - Created date
4. Add "Create Trip" button (links to /trips/new)
5. Add loading and error states
6. Add empty state ("No trips yet")

**Test Criteria:**
- [ ] Page loads without errors
- [ ] Shows loading spinner initially
- [ ] Displays trips in cards
- [ ] Shows empty state for new user
- [ ] Create button navigates to /trips/new

**Manual Test:**
1. Login as dev user
2. Navigate to /trips
3. Should see empty state
4. Click "Create Trip"

**Demo Impact:** ✅ User can see trips list in UI

---

#### Task 1.7: Create Frontend Trip Creation Form
**Time:** 2 hours  
**Branch:** `feat/trip-ui`

**Implementation:**
1. Create `apps/frontend/src/pages/TripNew.jsx`
2. Form fields:
   - Destination (text input)
   - Days (number input, 1-10)
   - Pace (radio buttons: relaxed/balanced/fast)
3. On submit:
   - POST /api/trips
   - Show loading spinner
   - On success: navigate to /trips
   - On error: show error message
4. Add form validation
5. Add i18n keys

**Test Criteria:**
- [ ] Form renders correctly
- [ ] Validation works (required fields)
- [ ] Submit calls API with correct data
- [ ] Redirects to /trips on success
- [ ] Shows error message on failure

**Manual Test:**
1. Navigate to /trips/new
2. Fill in form
3. Submit
4. Should create trip and redirect

**Demo Impact:** ✅ Full trip creation flow works

---

#### Task 1.8: Add Trip Routes to App
**Time:** 15 minutes  
**Branch:** `feat/trip-ui`

**Implementation:**
1. Update `apps/frontend/src/App.jsx`
2. Import Trips and TripNew components
3. Add routes:
   - `/trips` → Trips (protected)
   - `/trips/new` → TripNew (protected)
4. Update navigation in SiteLayout

**Test Criteria:**
- [ ] Routes accessible when logged in
- [ ] Redirect to /login when not logged in
- [ ] Navigation links work

**Demo Impact:** ✅ Trip pages integrated into app

---

### Feature 2: Map Visualization

#### Task 2.1: Install Map Dependencies
**Time:** 15 minutes  
**Branch:** `feat/map`

**Implementation:**
```bash
npm install leaflet react-leaflet --workspace=apps/frontend
npm install -D @types/leaflet --workspace=apps/frontend
```

**Test Criteria:**
- [ ] Dependencies installed
- [ ] No version conflicts
- [ ] App still builds

**Demo Impact:** None (prep work)

---

#### Task 2.2: Create Geocoding Utility
**Time:** 1 hour  
**Branch:** `feat/map`

**Implementation:**
1. Update `apps/frontend/src/services/geocode.js`
2. Add Nominatim geocoding:
```javascript
export const geocodeDestination = async (destination) => {
  const url = `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(destination)}&format=json&limit=1`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
};
```
3. Add caching (localStorage)
4. Add error handling

**Test Criteria:**
- [ ] Returns lat/lng for valid city
- [ ] Returns null for invalid city
- [ ] Caches results
- [ ] Handles network errors

**Test Command:**
```javascript
// In browser console
const coords = await geocodeDestination('Paris');
console.log(coords); // Should be ~{lat: 48.8566, lng: 2.3522}
```

**Demo Impact:** None (utility function)

---

#### Task 2.3: Create MapView Component
**Time:** 2 hours  
**Branch:** `feat/map`

**Implementation:**
1. Create `apps/frontend/src/components/MapView.jsx`
2. Props: `{ destination, itinerary, center }`
3. Render Leaflet map
4. Add OpenStreetMap tiles
5. Add destination marker (red)
6. Add itinerary markers (blue)
7. Add marker popups
8. Style map container (400px height)

**Test Criteria:**
- [ ] Map renders without errors
- [ ] Shows OSM tiles
- [ ] Destination marker visible
- [ ] Itinerary markers visible
- [ ] Popups show location names
- [ ] Mobile responsive

**Demo Impact:** ✅ Map visible (no data yet)

---

#### Task 2.4: Integrate Map into Trip Details
**Time:** 1 hour  
**Branch:** `feat/map`

**Implementation:**
1. Create `apps/frontend/src/pages/TripDetails.jsx`
2. Fetch trip: `GET /api/trips/:id`
3. Geocode destination
4. Render MapView with trip data
5. Add route: `/trips/:id` in App.jsx

**Test Criteria:**
- [ ] Trip details page loads
- [ ] Map shows correct destination
- [ ] Itinerary markers display
- [ ] Loading states work

**Manual Test:**
1. Create a trip
2. Click on trip card
3. Should see trip details with map

**Demo Impact:** ✅ Full map visualization

---

### Feature 3: Day-wise Itinerary View

#### Task 3.1: Create ItineraryView Component
**Time:** 2 hours  
**Branch:** `feat/itinerary`

**Implementation:**
1. Create `apps/frontend/src/components/ItineraryView.jsx`
2. Props: `{ itinerary }`
3. Render day cards:
   - Day number
   - Area name
   - Total hours
   - Time slots (morning/afternoon/evening)
   - Activities with duration
4. Add expand/collapse for each day
5. Style as timeline

**Test Criteria:**
- [ ] All days render
- [ ] Time slots organized correctly
- [ ] Activities show name and duration
- [ ] Expand/collapse works
- [ ] Mobile responsive

**Demo Impact:** ✅ Day-wise view visible

---

#### Task 3.2: Integrate Itinerary into Trip Details
**Time:** 30 minutes  
**Branch:** `feat/itinerary`

**Implementation:**
1. Update `TripDetails.jsx`
2. Add ItineraryView below MapView
3. Add tab navigation: Map | Itinerary
4. Responsive layout

**Test Criteria:**
- [ ] Both views display
- [ ] Tab switching works
- [ ] Data synced between views

**Demo Impact:** ✅ Complete trip visualization

---

### Feature 4: Trip Editing

#### Task 4.1: Create PUT /api/trips/:id Endpoint
**Time:** 1 hour  
**Branch:** `feat/trip-edit`

**Implementation:**
1. Update `api/trips/[id].js` to handle PUT
2. Add authentication + authorization
3. Allow updates:
   - destination
   - days
   - pace
   - status
   - startDate
   - itinerary
4. Validate changes
5. Update updatedAt timestamp
6. Return updated trip

**Test Criteria:**
- [ ] Returns 401 without JWT
- [ ] Returns 403 for other user's trip
- [ ] Returns 404 for non-existent trip
- [ ] Returns 400 for invalid data
- [ ] Returns 200 with updated trip
- [ ] Changes persisted to storage

**Test Command:**
```bash
curl -X PUT http://localhost:3000/api/trips/$TRIP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

**Demo Impact:** ✅ Backend supports editing

---

#### Task 4.2: Add Inline Editing to Trip Details
**Time:** 2 hours  
**Branch:** `feat/trip-edit`

**Implementation:**
1. Update `TripDetails.jsx`
2. Add "Edit" mode toggle
3. Make fields editable:
   - Destination (text input)
   - Days (number input)
   - Start date (date picker)
4. Add "Save" and "Cancel" buttons
5. Call PUT /api/trips/:id on save

**Test Criteria:**
- [ ] Edit mode toggles correctly
- [ ] Fields become editable
- [ ] Save calls API with changes
- [ ] Cancel reverts changes
- [ ] UI updates on success

**Demo Impact:** ✅ User can edit trips

---

### Feature 5: Trip Status Management

#### Task 5.1: Create Status UI Component
**Time:** 1 hour  
**Branch:** `feat/status`

**Implementation:**
1. Create `apps/frontend/src/components/TripStatus.jsx`
2. Props: `{ status, onChange }`
3. Render status badge with color
4. Add status dropdown menu
5. Emit onChange when status selected

**Test Criteria:**
- [ ] Badge shows correct color
- [ ] Dropdown opens
- [ ] All statuses listed
- [ ] onChange fires with new status

**Demo Impact:** ✅ Status management UI

---

#### Task 5.2: Add Status Actions to Trip Details
**Time:** 1 hour  
**Branch:** `feat/status`

**Implementation:**
1. Update `TripDetails.jsx`
2. Add TripStatus component
3. Add action buttons:
   - "Start Trip" (planning → active)
   - "Complete Trip" (active → completed)
   - "Archive" (any → archived)
4. Call PUT /api/trips/:id on action

**Test Criteria:**
- [ ] Buttons show based on status
- [ ] Actions update status
- [ ] UI reflects new status

**Demo Impact:** ✅ Status management works

---

### Feature 6: Transportation Hubs (Mock)

#### Task 6.1: Create Mock Hub Data
**Time:** 1 hour  
**Branch:** `feat/hubs`

**Implementation:**
1. Create `api/lib/transportHubs.js`
2. Add mock data for 20 major cities:
```javascript
{
  'Paris': {
    airport: { name: 'CDG', lat: 49.0097, lng: 2.5479 },
    trainStation: { name: 'Gare du Nord', lat: 48.8809, lng: 2.3553 },
    busStation: { name: 'Bercy Seine', lat: 48.8386, lng: 2.3832 }
  }
}
```
3. Add `getHubsForCity(city)` function

**Test Criteria:**
- [ ] Data structure correct
- [ ] Function returns hubs for valid city
- [ ] Returns null for unknown city

**Demo Impact:** None (data only)

---

#### Task 6.2: Display Hubs on Map
**Time:** 1 hour  
**Branch:** `feat/hubs`

**Implementation:**
1. Update `MapView.jsx`
2. Fetch hubs for destination
3. Add hub markers (different icon)
4. Add hub popups with name and type

**Test Criteria:**
- [ ] Hub markers visible
- [ ] Different icon from regular markers
- [ ] Popups show hub info

**Demo Impact:** ✅ Hubs visible on map

---

#### Task 6.3: Add Transportation Section to UI
**Time:** 1 hour  
**Branch:** `feat/hubs`

**Implementation:**
1. Update `TripDetails.jsx`
2. Add "Transportation" section
3. List hubs with distances
4. Add "How to get there" links (future)

**Test Criteria:**
- [ ] Section displays hubs
- [ ] Distances calculated
- [ ] UI looks good

**Demo Impact:** ✅ Transportation info visible

---

## Sprint Timeline

### Week 1 (Current)
- [ ] Tasks 1.1 - 1.8 (Trip Persistence)
- [ ] Deploy to Vercel
- [ ] Test in production

### Week 2
- [ ] Tasks 2.1 - 2.4 (Map Visualization)
- [ ] Tasks 3.1 - 3.2 (Itinerary View)
- [ ] Deploy to Vercel

### Week 3
- [ ] Tasks 4.1 - 4.2 (Trip Editing)
- [ ] Tasks 5.1 - 5.2 (Status Management)
- [ ] Deploy to Vercel

### Week 4
- [ ] Tasks 6.1 - 6.3 (Transportation Hubs)
- [ ] Final testing
- [ ] MVP1 completion review
- [ ] Get approval for MVP2

---

## Definition of Done (Per Task)

- [ ] Code written and tested locally
- [ ] No linter errors
- [ ] Test criteria met
- [ ] Documentation updated (if needed)
- [ ] Committed to feature branch
- [ ] App still works (demo-ready)

---

## Roll-back Strategy

If a task breaks the app:
1. Revert the commit
2. Fix on a separate branch
3. Test thoroughly before re-merging
4. Document what went wrong

---

**Maintained By:** TripMaker Development Team  
**Next Update:** After each task completion
