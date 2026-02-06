# MVP3 Task Breakdown - Real-Time Trip Execution

**Phase:** MVP3 - Real-Time Trip Execution  
**Status:** ✅ Implementation complete; browser verification pending  
**Last Updated:** February 4, 2026

**Prerequisites:** MVP1 & MVP2 100% complete. Zero-cost: Browser Geolocation, polling/WebSocket for chat; Cloudflare R2 for media (100 MB/user).

---

## Atomic Task Principle

Every task must:
1. Be completable in 1–3 hours
2. Result in a working, testable feature
3. Include clear test criteria
4. Keep the app demo-ready
5. **Be verified in browser after completion**

---

## MVP3 Features (from MVP_PLAN.md)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 3.1 | Timeline/feed preferences | P2 | ✅ Done |
| 3.2 | Real-time location tracking | P0 | ✅ Done |
| 3.3 | Live map with current location | P0 | ✅ Done |
| 3.4 | ETA, delays, alerts | P1 | ✅ Done |
| 3.5 | In-trip chat | P1 | ✅ Done |
| 3.6 | Media upload in chat (R2, 100MB/user) | P2 | ✅ Done |
| 3.7 | Like/comment on feed trips | P1 | ✅ Done |
| 3.8 | Share trips externally | P2 | ✅ Done |

---

## Implementation Order

1. **3.2 + 3.3** – Real-time location + live map (P0)
2. **3.4** – ETA, delays, alerts (P1)
3. **3.5** – In-trip chat (P1)
4. **3.7** – Like/comment on feed (P1)
5. **3.1** – Timeline/feed preferences (P2)
6. **3.6** – Media upload in chat (R2, 100MB, profile usage) (P2)
7. **3.8** – Share trips externally (P2)

---

## Phase 3.2 + 3.3: Real-Time Location & Live Map (P0)

**Goal:** User can enable “track my location” and see their current position on the trip map.

### Task 3.2.1: Location service / hook ✅
- [x] Create `src/hooks/useLocation.js` using browser Geolocation API.
- [x] Expose: get current position (one-shot), watch (continuous) with cleanup; return `{ position, error, loading, requestPosition, startWatching, stopWatching }`.
- [x] Handle errors (permission denied, unavailable) and return error state.
- [x] **Acceptance:** Hook returns `{ lat, lng }` when permission granted; error state when denied.

### Task 3.3.1: Live map with current location marker ✅
- [x] Extend `MapView` to accept optional `currentLocation?: { lat, lng }`.
- [x] When provided, show a distinct “You are here” marker (e.g. blue dot or custom icon).
- [x] **Acceptance:** On Trip Detail (or dedicated “Live” view), enabling location shows user marker on map.

### Task 3.3.2: Trip Detail – "Show my location" toggle ✅
- [x] On Trip Detail, add toggle/button “Show my location” (only when map is shown).
- [x] When on: request geolocation, pass position to MapView; show “You are here” marker.
- [x] When off: stop watching; remove user marker.
- [x] **Acceptance:** User can turn on/off live location on trip detail; marker appears/disappears; no console errors.

---

## Phase 3.4: ETA, Delays, Alerts (P1)

**Goal:** Show ETA to next stop and simple delay alerts (client-side, no paid APIs).

### Task 3.4.1: ETA to next stop (client-side) ✅
- [x] Compute distance from current position to closest itinerary stop (Haversine in `utils/distance.js`).
- [x] Display “~X km to [Name] · ~Y min” when location is on; “Very close to [Name]” when &lt; 0.2 km.
- [x] **Acceptance:** When live location enabled, user sees approximate distance/time to next place.

### Task 3.4.2: Simple delay/alert UI ✅
- [x] If user is &gt; 15 km from closest stop, show subtle alert (“Far from next stop — consider adjusting your schedule.”).
- [x] **Acceptance:** Basic ETA/delay messaging visible when applicable.

---

## Phase 3.5: In-Trip Chat (P1)

**Goal:** Trip-specific chat (polling or free-tier realtime); text first.

### Task 3.5.1: Backend – chat messages model & API ✅
- [x] Model: messages per trip (trip.messages: [{ id, userId, text, createdAt }]).
- [x] GET /trips/:id/messages (paginated: limit, offset); POST /trips/:id/messages (auth; owner or editor).
- [x] **Acceptance:** API supports list + send for a trip (Vercel api + apps/backend).

### Task 3.5.2: Frontend – chat UI on Trip Detail ✅
- [x] Chat section on Trip Detail (Trip chat); load messages (poll every 5s); send message; show sender (You / Trip member) and time.
- [x] **Acceptance:** User can read and send messages; list updates on poll; only owner/editor can post.

---

## Phase 3.7: Like/Comment on Feed (P1)

**Goal:** Users can like and comment on public trips in the feed.

### Task 3.7.1: Backend – likes and comments ✅
- [x] Model: trip.likes = [userId], trip.comments = [{ id, userId, text, createdAt }]; ensureLikes/ensureComments.
- [x] Feed response includes likeCount, commentCount, userLiked (when auth).
- [x] POST /trips/:id/like (like), DELETE /trips/:id/like (unlike); GET/POST /trips/:id/comments (list, add). Public trips only for like; comments include authorEmail.
- [x] **Acceptance:** API supports like/unlike and list/add comments (Vercel api + apps/backend).

### Task 3.7.2: Frontend – like and comment UI on Feed ✅
- [x] Feed cards: like button (heart + count), Comments (count) button; expand to show comment list + add-comment form (when logged in).
- [x] **Acceptance:** User can like/unlike and add/view comments on feed trips; feed sends auth so userLiked is set.

---

## Phase 3.1: Timeline/Feed Preferences (P2)

**Goal:** User can set interests / preferred destinations; feed can be filtered.

### Task 3.1.1: Profile – interests / preferred destinations ✅
- [x] Add optional profile fields (e.g. interests, preferredDestinations).
- [x] **Acceptance:** User can set and see preferences in Profile/Settings.

### Task 3.1.2: Feed – filter by preference ✅
- [x] Feed API accepts optional filter by destination/interest; frontend filter controls.
- [x] **Acceptance:** Feed can be filtered by user preferences.

---

## Phase 3.6: Media Upload in Chat (P2)

**Goal:** In-trip chat supports image uploads via Cloudflare R2; 100 MB/user limit; usage in Profile.

### Task 3.6.1: Backend – R2 integration & upload API ✅
- [x] Configure Cloudflare R2 (bucket, credentials); presigned PUT URL endpoint.
- [x] POST /upload/presign: check user storage usage; enforce 100 MB limit; return uploadUrl + key; record size on message post.
- [x] **Acceptance:** Upload succeeds within limit; over limit returns 413 or clear error.

### Task 3.6.2: Backend – user storage usage ✅
- [x] Track per-user total bytes in user profile (profile.storageUsed); increment when message with imageKey is posted.
- [x] GET /profile returns `storageUsed`, `limitBytes` (100 MB limit).
- [x] **Acceptance:** Usage accurately reflects uploads; 100 MB enforced.

### Task 3.6.3: Frontend – media in chat ✅
- [x] Chat: “Attach image” (max 5 MB); get presign, PUT to R2, POST message with imageKey; show thumbnail in chat.
- [x] **Acceptance:** User can attach image to message; it appears in chat; usage updates.

### Task 3.6.4: Frontend – storage usage in Profile/Settings ✅
- [x] Profile: display “Storage: X MB / 100 MB” (from profile API).
- [x] **Acceptance:** User sees current usage in Profile/Settings.

---

## Phase 3.8: Share Trips Externally (P2)

**Goal:** User can copy a shareable link to a trip (e.g. public view or invite).

### Task 3.8.1: Shareable trip link ✅
- [x] Trip detail: “Copy link” button; link points to public view or trip page (with optional token).
- [x] **Acceptance:** Copying link and opening in new tab shows trip (or appropriate view).

---

## Phase 3.9–3.13: Trip Gallery, Thumbnail, Comment Images, Listings

**Goal:** Trip gallery (not chat images), trip thumbnail, comments with images, gallery page (carousel, likes/comments per image), listings highlight images.

### Task 3.9.1: Backend – trip thumbnailKey and gallery
- [ ] Trip model: add `thumbnailKey` (optional), `gallery` array. Each gallery item: `{ id, imageKey, userId, createdAt, likes: [userId], comments: [{ id, userId, text, imageKey?, createdAt }] }`.
- [ ] PUT /trips/:id allows `thumbnailKey`; validate key belongs to user and exists in R2.
- [ ] POST /trips/:id/gallery body `{ imageKey }`; add item; count storage. GET /trips/:id/gallery returns gallery (with author emails).
- [ ] **Acceptance:** Trip can have thumbnail and gallery; storage enforced.

### Task 3.9.2: Backend – gallery image likes and comments
- [ ] POST/DELETE /trips/:id/gallery/:imageId/like. GET/POST /trips/:id/gallery/:imageId/comments (comment may have imageKey); count storage for comment images.
- [ ] **Acceptance:** Gallery images have likes and comments (with optional image).

### Task 3.9.3: Backend – trip comments support imageKey
- [ ] POST /trips/:id/comments body `{ text, imageKey? }`; validate and count storage.
- [ ] **Acceptance:** Feed trip comments can include an image.

### Task 3.9.4: Backend – feed and list include thumbnail + galleryPreview
- [ ] GET /trips and GET /trips/feed include `thumbnailKey` and `galleryPreview` (e.g. first 5 image keys) per trip.
- [ ] **Acceptance:** List and feed responses include image data for cards.

### Task 3.10.1: Frontend – trip thumbnail upload
- [ ] Trip Detail: "Add cover" / "Change cover" → file pick → presign → upload → PUT trip with thumbnailKey. Show thumbnail when present.
- [ ] **Acceptance:** User can set/update trip cover image.

### Task 3.10.2: Frontend – gallery row and Gallery page
- [ ] Trip Detail: row of gallery images (first N) + "Gallery" button → /trips/:id/gallery. Chat: no new image attach (images go to gallery).
- [ ] Gallery page: carousel (current image, prev/next buttons, slide). Each image: like button + count, comments count + expand list + add comment (optional image).
- [ ] **Acceptance:** Gallery opens from trip; carousel and per-image likes/comments work.

### Task 3.10.3: Frontend – comment images and listing cards
- [ ] Feed and gallery-image comment composers: optional "Attach image"; presign → upload → POST with imageKey.
- [ ] My Trips and Discover cards: show trip thumbnail (or placeholder). Discover: show thumbnail + gallery preview images when available.
- [ ] **Acceptance:** Comments can have images; listings highlight trip and gallery images.

---

## Browser Verification (MVP3)

After each task:
1. Run `npm run dev`.
2. Open http://localhost:5173; log in as dev user (`dev@tripmaker.com` / `DevUser123!`).
3. Exercise the new flow (see steps below).
4. Confirm no console errors; feature works as described in Acceptance.

### MVP3 Tasks 3.2 + 3.3 (Live location + map marker)
- [ ] **Login:** Go to http://localhost:5173 → Log in with dev user → Redirects to Home.
- [ ] **Open trip:** My Trips → open any trip (or create one from Home) → Trip Detail loads with map.
- [ ] **Show my location:** Click **"Show my location"** next to the Map heading → Browser may prompt for location permission.
- [ ] **Allow permission:** If prompted, allow location access → Button text becomes "Getting location..." then "Hide my location"; a green **"You are here"** marker appears on the map.
- [ ] **Hide my location:** Click **"Hide my location"** → Marker disappears; button shows "Show my location" again.
- [ ] **Permission denied:** If you deny permission (or block in browser), an error message appears (e.g. "Location permission denied."); no console errors.
- [ ] **No console errors:** DevTools → Console shows no errors during the flow.

### MVP3 Task 3.4 (ETA + delay alert)
- [ ] With **Show my location** on and itinerary markers loaded: ETA line appears (e.g. “~X km to [Place] · ~Y min”).
- [ ] If very close to a marker: “Very close to [Place]” in green.
- [ ] If &gt; 15 km from closest stop: yellow “Far from next stop…” alert appears.
- [ ] No console errors.

### MVP3 Task 3.5 (In-trip chat)
- [ ] On Trip Detail: “Trip chat” section appears; “No messages yet…” when empty.
- [ ] Type a message and click **Send**: message appears with “You” and time; no console errors.
- [ ] Refresh or wait ~5s: messages still visible (polling).
- [ ] As viewer: messages visible but no input (only owner/editor can post).
- [ ] No console errors.

### MVP3 Task 3.7 (Like/comment on feed)
- [ ] **Discover:** Log in → Discover; feed cards show ♥ and like count, “Comments (0)” (or count).
- [ ] **Like:** Click ♥ on a public trip → count increases, heart stays filled; click again → unlike.
- [ ] **Comments:** Click “Comments (0)” → panel expands; “No comments yet.” or list; type and **Post** → comment appears with your email and time.
- [ ] **No auth:** Log out → feed still loads; like count visible; Comments expand shows list but no add form.
- [ ] No console errors.

### MVP3 Task 3.8 (Share trip link)
- [ ] **Trip Detail:** Open any trip → “Copy link” appears in the meta row (next to days/status).
- [ ] **Copy:** Click “Copy link” → button shows “Link copied!” briefly; paste elsewhere → URL is `/trips/<trip-id>` (or full origin + path).
- [ ] **Open in new tab:** Paste link in new tab → trip loads (or login then trip) if user has access or trip is public.
- [ ] No console errors.

### MVP3 Task 3.1 (Timeline/feed preferences)
- [ ] **Profile:** Profile → “Interests” and “Preferred destinations” fields; enter comma-separated values (e.g. “history, food”, “Paris, Tokyo”) → Save → reload → values persist.
- [ ] **Feed:** Discover → two filter inputs: destination and interest; submit with interest (e.g. “Paris”) → feed shows only trips whose destination or name contains “Paris”.
- [ ] No console errors.

### MVP3 Gallery, Thumbnail & Comment Images (3.9–3.13)
- [x] **Trip Detail:** Gallery section shows cover (if set), “Add cover” / “Change cover”, “Add to gallery”, row of gallery thumbs, “View gallery (N)” link.
- [x] **Trip Gallery page:** Minimal header (round back + trip name + add icon, no duplicate add). Empty state: icon, “No photos yet”, copy; upload shows “Uploading image...” loading. Carousel with prev/next, counter, thumb strip; click thumb or arrow or keyboard ←/→ to change image; like and comments (with image attach) per image.
- [x] **Trip comments (Detail + Feed):** Comment form has “Attach image”; post comment with image → image appears in comment list; comment list shows inline image thumbnails.
- [x] **My Trips list:** Trip cards show thumbnail image (or gradient placeholder) as hero.
- [x] **Discover (Feed):** Cards show trip thumbnail as hero (or gradient); if gallery preview exists, small gallery row below hero.
- [x] No console errors (build verified).

---

**Maintained by:** Development team  
**See also:** MVP_PLAN.md (MVP3 features), MVP_ROADMAP.md, MVP1_BROWSER_TEST_CHECKLIST.md
