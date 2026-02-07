# 🔌 TripMaker API Reference

**Base URL (Local):** `http://localhost:3000`  
**Base URL (Production):** `https://trip-maker-pink.vercel.app/api`  
**API Version:** 2.0.0  
**Last Updated:** January 31, 2026 (trips list + get + save UI)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Testing](#testing)

---

## Authentication

### JWT Token Format

```
Authorization: Bearer <jwt_token>
```

### Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": "user-uuid",
    "email": "user@example.com",
    "iat": 1706644800,
    "exp": 1707249600
  }
}
```

### Token Expiry
- **Default:** 7 days
- **Configurable via:** `JWT_EXPIRES_IN` environment variable

---

## Endpoints

### 🏥 Health Check

**Endpoint:** `GET /health` or `GET /api/health`  
**Authentication:** None  
**Rate Limit:** 100 req/15min

#### Request

```bash
curl http://localhost:3000/health
```

#### Response (200 OK)

```json
{
  "status": "ok"
}
```

---

### 📄 API Root

**Endpoint:** `GET /` or `GET /api`  
**Authentication:** None  
**Rate Limit:** 100 req/15min

#### Request

```bash
curl http://localhost:3000/
```

#### Response (200 OK)

```json
{
  "message": "TripMaker API",
  "version": "2.0.0",
  "documentation": "/api-docs"
}
```

---

### 🔐 User Registration

**Endpoint:** `POST /register` or `POST /api/auth/register`  
**Authentication:** None  
**Rate Limit:** 5 req/15min

#### Request

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Minimum 8 characters |
| `confirmPassword` | string | Yes | Must match password |

#### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Registration successful. Please log in."
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": "Email and password are required."
}
```

**409 Conflict** - Email already exists
```json
{
  "error": "Email is already registered."
}
```

**500 Internal Server Error**
```json
{
  "error": "Registration failed",
  "message": "Detailed error message"
}
```

---

### 🔑 User Login

**Endpoint:** `POST /login` or `POST /api/auth/login`  
**Authentication:** None  
**Rate Limit:** 10 req/15min

#### Request

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@tripmaker.com",
    "password": "DevUser123!"
  }'
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email |
| `password` | string | Yes | User's password |

#### Response (200 OK)

```json
{
  "id": "dev-user-00000000-0000-0000-0000-000000000001",
  "email": "dev@tripmaker.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful."
}
```

#### Error Responses

**400 Bad Request** - Missing fields
```json
{
  "error": "Email and password are required."
}
```

**401 Unauthorized** - Invalid credentials
```json
{
  "error": "Invalid credentials."
}
```

**500 Internal Server Error**
```json
{
  "error": "Login failed",
  "message": "Detailed error message"
}
```

---

### 🧭 Generate Trip Plan

**Endpoint:** `POST /trips/plan` or `POST /api/trips/plan`  
**Authentication:** None  
**Rate Limit:** 100 req/15min

#### Request

```bash
curl -X POST http://localhost:3000/trips/plan \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris",
    "days": 3,
    "pace": "balanced"
  }'
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `destination` | string | Yes | City or destination name |
| `days` | integer | No | 1-10 days (default: 3) |
| `pace` | string | No | `relaxed`, `balanced`, or `fast` |
| `seed` | number | No | Optional seed for regeneration |

#### Response (200 OK)

```json
{
  "destination": "Paris",
  "pace": "balanced",
  "days": 3,
  "generatedAt": "2026-01-30T18:45:00.000Z",
  "isFallback": false,
  "meta": {
    "totalStops": 12,
    "avgStopsPerDay": 4,
    "avgHoursPerDay": 5.5,
    "maxHoursPerDay": 6,
    "maxStopsPerDay": 4
  },
  "itinerary": [
    {
      "day": 1,
      "area": "Montmartre",
      "totalHours": 5.5,
      "slots": [
        {
          "timeOfDay": "morning",
          "totalHours": 2.5,
          "items": [
            {
              "name": "Sacre-Coeur Basilica",
              "category": "viewpoint",
              "durationHours": 1.5
            }
          ]
        }
      ]
    }
  ]
}
```

#### Error Responses

**400 Bad Request** - Missing destination or invalid days
```json
{
  "error": "Destination is required."
}
```

**500 Internal Server Error**
```json
{
  "error": "Trip plan generation failed",
  "message": "Detailed error message"
}
```

---

### 🤖 Trip Agent Chat (MVP4)

**Endpoint:** `POST /trips/agent/chat` or `POST /api/trips/agent/chat`  
**Authentication:** None  
**Rate Limit:** Same as general (100 req/15min)

Chat with the AI trip agent to generate or refine an itinerary. Returns the same response shape as `POST /trips/plan`. If no AI provider is configured or the AI call fails, the backend falls back to the static trip planner.

#### Request

```bash
curl -X POST http://localhost:3000/trips/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Create a 3 day relaxed trip to Rome" }
    ],
    "context": {
      "destination": "Rome",
      "days": 3,
      "pace": "relaxed"
    }
  }'
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | array | Yes | Chat history: `[{ role: "user"|"assistant", content: string }]` |
| `context` | object | No | `destination`, `days`, `pace`, optional `currentItinerary` (for edits) |

#### Response (200 OK)

Same shape as [Generate Trip Plan](#-generate-trip-plan): `destination`, `pace`, `days`, `generatedAt`, `isFallback`, `meta`, `itinerary`. When the AI fails (e.g. 429) and the static fallback is used, the response also includes `agentUnavailable: true` so the client can show a short message (e.g. "AI temporarily limited; try again in a few minutes").

#### Backend configuration

- **Fallback chain:** Tried in order: (1) Gemini, (2) Groq. If both are configured and one fails (e.g. 429), the other is tried. If all fail or no keys are set, the static plan is returned.
- **Env:**  
  - **Gemini:** `GEMINI_API_KEY` or `TRIP_AGENT_PROVIDER=gemini` + `TRIP_AGENT_API_KEY`  
  - **Groq (fallback):** `GROQ_API_KEY`  
  When no keys are set, the endpoint returns the static plan only.
- **Reference:** [MVP4_AI_AGENT.md](MVP4_AI_AGENT.md)

---

### 🧳 Create Trip

**Endpoint:** `POST /trips` or `POST /api/trips`  
**Authentication:** Required (JWT)  
**Rate Limit:** 100 req/15min

#### Request

```bash
curl -X POST http://localhost:3000/trips \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paris Family Vacation",
    "destination": "Paris",
    "days": 3,
    "pace": "balanced",
    "itinerary": [
      {
        "day": 1,
        "area": "Montmartre",
        "totalHours": 5.5,
        "slots": []
      }
    ]
  }'
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Trip name |
| `destination` | string | Yes | City or destination name |
| `days` | integer | No | 1-10 days (defaults to itinerary length) |
| `pace` | string | No | `relaxed`, `balanced`, or `fast` |
| `itinerary` | array | Yes | Day-by-day itinerary array (non-empty) |
| `transportMode` | string | No | MVP2: `flight`, `train`, or `bus` |

#### Response (201 Created)

```json
{
  "id": "trip-uuid",
  "userId": "dev-user-00000000-0000-0000-0000-000000000001",
  "name": "Paris Family Vacation",
  "destination": "Paris",
  "days": 3,
  "pace": "balanced",
  "status": "upcoming",
  "itinerary": [
    {
      "day": 1,
      "area": "Montmartre",
      "totalHours": 5.5,
      "slots": []
    }
  ],
  "createdAt": "2026-01-31T18:45:00.000Z",
  "updatedAt": "2026-01-31T18:45:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Missing or invalid fields
```json
{
  "error": "Trip name is required."
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "error": "Authorization token required."
}
```

**404 Not Found** - User not found
```json
{
  "error": "User not found."
}
```

---

### 📋 List Trips

**Endpoint:** `GET /trips` or `GET /api/trips`  
**Authentication:** Required (JWT)  
**Rate Limit:** 100 req/15min

#### Request

```bash
curl http://localhost:3000/trips \
  -H "Authorization: Bearer <token>"
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Optional. Filter by status: `upcoming`, `active`, `completed`, `archived` |

#### Response (200 OK)

```json
{
  "trips": [
    {
      "id": "trip-uuid",
      "userId": "user-uuid",
      "name": "Paris weekend",
      "destination": "Paris",
      "days": 3,
      "pace": "balanced",
      "status": "upcoming",
      "itinerary": [],
      "createdAt": "2026-01-31T18:45:00.000Z",
      "updatedAt": "2026-01-31T18:45:00.000Z"
    }
  ]
}
```

Trips are sorted by `createdAt` (newest first).

#### Error Responses

**401 Unauthorized** - Missing or invalid token  
**404 Not Found** - User not found  
**500 Internal Server Error**

---

### 🌍 Public Trip Feed (MVP2)

**Endpoint:** `GET /trips/feed` or `GET /api/trips/feed`  
**Authentication:** None  
**Rate Limit:** 100 req/15min

Returns public trips from all users. No auth required. Each trip in the response may include **`thumbnailKey`** (R2 key for cover image) and **`galleryPreview`** (array of up to 5 gallery image keys) for card display.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `destination` | string | Optional. Filter by destination (partial match). |
| `interest` | string | Optional. Filter by interest: trips whose destination or name contains this (case-insensitive). |
| `limit` | integer | Optional. Max trips to return (1-50, default 20). |

#### Response (200 OK)

```json
{
  "trips": [
    {
      "id": "trip-uuid",
      "userId": "user-uuid",
      "name": "Paris weekend",
      "destination": "Paris",
      "days": 3,
      "pace": "balanced",
      "status": "upcoming",
      "isPublic": true,
      "ownerEmail": "user@example.com",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 🧳 Get Trip by ID

**Endpoint:** `GET /trips/:id` or `GET /api/trips/:id`  
**Authentication:** Optional (JWT)  
**Rate Limit:** 100 req/15min

**Access control:** The trip is returned only if:
- The requester is the **owner** or a **collaborator** (any visibility), or
- The trip is **public** (`isPublic === true`).

**Private trips** are never returned to unauthenticated users or to users who are not the owner or a collaborator; the API returns **404 Trip not found** (so existence of private trips is not leaked). Public trips include `ownerEmail`.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Trip ID |

#### Response (200 OK)

Returns the full trip object (same shape as Create Trip response). Trip may include **`thumbnailKey`** (cover image R2 key) and **`gallery`** (array of gallery items: `{ id, imageKey, userId, createdAt, likes, comments }`). Public trips include `ownerEmail`. When the requester is the owner or a collaborator, the trip includes a **`collaborators`** array: `[{ userId, email, role }]` — users who joined via invite code. Use this to show "People on this trip" and to remove collaborators (see Remove collaborator).

#### Error Responses

**404 Not Found** - Trip not found or not public (when not owner)  
**500 Internal Server Error**

---

### ✏️ Update Trip

**Endpoint:** `PUT /trips/:id` or `PUT /api/trips/:id`  
**Authentication:** Required (JWT)  
**Rate Limit:** 100 req/15min

#### Request

```bash
curl -X PUT http://localhost:3000/trips/<trip-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated name","status":"completed"}'
```

#### Request Body (all fields optional)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Trip name |
| `destination` | string | Destination |
| `days` | integer | 1-10 |
| `pace` | string | relaxed, balanced, fast |
| `status` | string | upcoming, active, completed, archived |
| `itinerary` | array | Full itinerary array |
| `transportMode` | string \| null | MVP2: flight, train, or bus. Pass null to clear. |
| `isPublic` | boolean | MVP2: Show trip in public feed. |
| `thumbnailKey` | string \| null | MVP3.10: R2 key for trip cover image (e.g. `uploads/userId/uuid.jpg`). Must be owned by user and exist in R2. Pass null to clear. |

#### Response (200 OK)

Returns the updated trip object (includes `thumbnailKey`, `gallery` when present).

---

### 🗑️ Delete Trip

**Endpoint:** `DELETE /trips/:id` or `DELETE /api/trips/:id`  
**Authentication:** Required (JWT)

#### Response (200 OK)

```json
{ "message": "Trip deleted." }
```

---

### 📦 Archive Trip

**Endpoint:** `PATCH /trips/:id/archive` or `PATCH /api/trips/:id/archive`  
**Authentication:** Required (JWT)

Sets trip `status` to `archived`. Returns the updated trip.

---

### 📤 Unarchive Trip

**Endpoint:** `PATCH /trips/:id/unarchive` or `PATCH /api/trips/:id/unarchive`  
**Authentication:** Required (JWT)

Sets trip `status` back to `upcoming`. Returns the updated trip. Use when viewing an archived trip to restore it to the main list.

---

### 📨 Create Invite Code (MVP2)

**Endpoint:** `POST /trips/:id/invite` or `POST /api/trips/:id/invite`  
**Authentication:** Required (JWT)

Generates a one-time invite code (8 chars, 24h expiry). Body: `{ "role": "viewer" | "editor" }`. Returns `{ code, role, expiresAt }`.

---

### 👥 Remove Collaborator (MVP2)

**Endpoint:** `DELETE /trips/:id/collaborators/:userId` or `DELETE /api/trips/:id/collaborators/:userId`  
**Authentication:** Required (JWT)

Removes a collaborator from the trip. Only the **trip owner** or an **editor** may call this. Editors can remove **viewers** only; only the **owner** can remove editors. The trip owner cannot be removed.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Trip ID |
| `userId` | string (UUID) | Collaborator's user ID to remove |

#### Response (200 OK)

```json
{ "message": "Collaborator removed.", "collaborators": [{ "userId": "...", "email": "...", "role": "viewer" }] }
```

#### Error Responses

**400 Bad Request** - Cannot remove the trip owner.  
**403 Forbidden** - Only owner or editor can remove; only owner can remove editors.  
**404 Not Found** - Trip or collaborator not found.  
**500 Internal Server Error**

---

### 📋 Trip Prerequisites (Additional feature: MVP3–4)

Trip checklist items (things to bring or prepare). **GET /trips/:id** includes a **`prerequisites`** array. Public view: list only. Collaborators can add items; when trip **status** is **active**, they can assign items to collaborators and mark items as done. When trip is **completed**, only adding is allowed (no assign/edit/delete).

**Add item:** `POST /trips/:id/prerequisites` or `POST /api/trips/:id/prerequisites`  
**Authentication:** Required (JWT). User must be trip owner or collaborator.  
**Body:** `{ "title": "Passport", "description": "Optional", "category": "documents", "imageKey": "uploads/userId/uuid.jpg", "assigneeUserId": "user-uuid" }`. Only `title` required. `category`: one of `documents`, `clothing`, `electronics`, `medicine`, `other`. `assigneeUserId` only accepted when trip status is `active`.  
**Response (201):** Created prerequisite item: `{ id, title, description, category, imageKey, assigneeUserId, assigneeEmail, status: "pending", createdAt, createdBy }`.

**Update item (title, description, category, imageKey):** `PUT /trips/:id/prerequisites/:itemId` or `PUT /api/trips/:id/prerequisites/:itemId`  
**Authentication:** Required (JWT). Collaborator only. Not allowed when trip status is `completed`.  
**Body:** `{ "title", "description", "category", "imageKey" }` (all optional).  
**Response (200):** Updated trip (includes full `prerequisites` array).

**Update assignee or status:** `PATCH /trips/:id/prerequisites/:itemId` or `PATCH /api/trips/:id/prerequisites/:itemId`  
**Authentication:** Required (JWT). Collaborator only. **Only when trip status is `active`.**  
**Body:** `{ "assigneeUserId": "user-uuid" | null, "status": "pending" | "done" }` (both optional).  
**Response (200):** Updated trip.

**Delete item:** `DELETE /trips/:id/prerequisites/:itemId` or `DELETE /api/trips/:id/prerequisites/:itemId`  
**Authentication:** Required (JWT). Collaborator only. Not allowed when trip status is `completed`.  
**Response (200):** Updated trip (prerequisites array without the item).

**Errors:** 400 (validation), 403 (not collaborator or status not allowed), 404 (trip or item not found).

---

### 💬 Trip Chat Messages (MVP3)

**List messages:** `GET /trips/:id/messages` or `GET /api/trips/:id/messages`  
**Authentication:** Required (JWT). User must be trip owner or collaborator.  
**Query:** `limit` (default 50, max 100), `offset` (default 0).  
**Response (200):** `{ messages: [{ id, userId, text, imageKey?, createdAt }], total }`. Messages are newest-first. When a message has an image, it includes `imageKey` (R2 object key); use `GET /api/media/:key` to get a redirect URL to the image.

**Post message:** `POST /trips/:id/messages` or `POST /api/trips/:id/messages`  
**Authentication:** Required (JWT). Only trip owner or editors can post.  
**Body:** `{ "text": "Hello", "imageKey": "uploads/userId/uuid.jpg" }`. Either `text` or `imageKey` (or both) required. `imageKey` must be from a prior upload via presign; storage is charged when the message is posted.  
**Response (201):** `{ id, userId, text, imageKey?, createdAt }`.

---

### 📤 Upload presign (MVP3.6 – R2 media)

**Endpoint:** `POST /upload/presign` or `POST /api/upload/presign`  
**Authentication:** Required (JWT)

Get a presigned PUT URL to upload an image to Cloudflare R2. After uploading, post a chat message with the returned `key` as `imageKey`. User storage is enforced (100 MB limit); over limit returns 413.

**Body:** `{ "size": number, "contentType": "image/jpeg" }` (size in bytes; max 5 MB per file).  
**Response (200):** `{ uploadUrl, key, expiresIn: 900 }`. PUT the file to `uploadUrl` with `Content-Type` header, then POST message with `imageKey: key`.

**Errors:** 413 (file too large or storage limit exceeded), 503 (R2 not configured).

---

### 🖼️ Media redirect (MVP3.6)

**Endpoint:** `GET /media/:key` or `GET /api/media/:key`  
**Authentication:** None

Redirects to a short-lived presigned GET URL for an R2 object. Use as `img` src or link for chat images. Key format: `uploads/userId/uuid.ext` (URL-encoded in path).

---

### 👍 Trip Like (MVP3)

**Like:** `POST /trips/:id/like` or `POST /api/trips/:id/like`  
**Unlike:** `DELETE /trips/:id/like` or `DELETE /api/trips/:id/like`  
**Authentication:** Required (JWT). Trip must be public.  
**Response (200):** `{ liked: true|false, likeCount }`.

---

### 💬 Trip Comments (MVP3)

**List:** `GET /trips/:id/comments` or `GET /api/trips/:id/comments`  
**Query:** `limit`, `offset`. **Response (200):** `{ comments: [{ id, userId, text, createdAt, authorEmail }], total }`. Public trips: no auth required. Private: auth required and user must have access.

**Post:** `POST /trips/:id/comments` or `POST /api/trips/:id/comments`  
**Authentication:** Required (JWT). **Body:** `{ "text": "Nice trip!", "imageKey": "uploads/userId/uuid.jpg" }`. `imageKey` optional; must be from prior presign upload; storage counted. **Response (201):** `{ id, userId, text, imageKey?, createdAt, authorEmail }`.

---

### 🖼️ Trip Gallery (MVP3.9–3.12)

**List gallery:** `GET /trips/:id/gallery` or `GET /api/trips/:id/gallery`  
**Authentication:** Same as GET /trips/:id (owner, collaborator, or public trip).  
**Response (200):** `{ gallery: [{ id, imageKey, userId, createdAt, likes: [userId], comments: [{ id, userId, text, imageKey?, createdAt, authorEmail? }] }] }`.

**Add image:** `POST /trips/:id/gallery` or `POST /api/trips/:id/gallery`  
**Authentication:** Required (JWT). Owner or editor only. **Body:** `{ "imageKey": "uploads/userId/uuid.jpg" }`. Key must be from prior presign; storage counted. **Response (201):** created gallery item.

**Like image:** `POST /trips/:id/gallery/:imageId/like` or `POST /api/trips/:id/gallery/:imageId/like`  
**Unlike:** `DELETE /trips/:id/gallery/:imageId/like`  
**Authentication:** Required (JWT). **Response (200):** `{ liked: true|false, likeCount }`.

**List image comments:** `GET /trips/:id/gallery/:imageId/comments` or `GET /api/trips/:id/gallery/:imageId/comments`  
**Query:** `limit`, `offset`. **Response (200):** `{ comments: [{ id, userId, text, imageKey?, createdAt, authorEmail }], total }`.

**Post image comment:** `POST /trips/:id/gallery/:imageId/comments` or `POST /api/trips/:id/gallery/:imageId/comments`  
**Authentication:** Required (JWT). **Body:** `{ "text": "...", "imageKey": "..." }`. `imageKey` optional; storage counted. **Response (201):** created comment.

---

### 🔓 Redeem Invite Code (MVP2)

**Endpoint:** `POST /invite/redeem` or `POST /api/invite/redeem`  
**Authentication:** Required (JWT)

Redeems a code and adds the user as collaborator. Body: `{ "code": "ABC12345" }`. Returns `{ trip, role }`.

---

### 👤 Get User Profile

**Endpoint:** `GET /profile/:id` or `GET /api/profile/:id`  
**Authentication:** Optional (recommended)  
**Rate Limit:** 100 req/15min

#### Request

```bash
curl http://localhost:3000/profile/dev-user-00000000-0000-0000-0000-000000000001 \
  -H "Authorization: Bearer <token>"
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | User ID |

#### Response (200 OK)

```json
{
  "id": "dev-user-00000000-0000-0000-0000-000000000001",
  "email": "dev@tripmaker.com",
  "phone": "+1 555 123 4567",
  "country": "United States",
  "language": "en",
  "currencyType": "USD",
    "interests": ["history", "food"],
    "preferredDestinations": ["Paris", "Tokyo"],
    "storageUsed": 0,
    "limitBytes": 104857600,
    "createdAt": "2026-01-30T16:00:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid ID
```json
{
  "error": "User ID is required."
}
```

**404 Not Found** - User doesn't exist
```json
{
  "error": "User not found."
}
```

**500 Internal Server Error**
```json
{
  "error": "Profile fetch failed",
  "message": "Detailed error message"
}
```

---

### ✏️ Update User Profile

**Endpoint:** `PUT /profile/:id` or `PUT /api/profile/:id`  
**Authentication:** Optional (recommended)  
**Rate Limit:** 100 req/15min

#### Request

```bash
curl -X PUT http://localhost:3000/profile/dev-user-00000000-0000-0000-0000-000000000001 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1 416 555 1234",
    "country": "Canada",
    "language": "en",
    "currencyType": "CAD",
    "interests": ["history", "food"],
    "preferredDestinations": ["Paris", "Tokyo"]
  }'
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | User ID |

#### Request Body

All fields are optional:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `email` | string | Valid email, unique | User's email |
| `phone` | string | Any format | Phone number |
| `country` | string | Free text | Country name |
| `language` | string | `en`, `hi`, `ml`, `ar`, `es`, `de` | UI language |
| `currencyType` | string | `USD`, `EUR`, `INR`, `AED`, `GBP`, `CAD`, `AUD` | Preferred currency |
| `interests` | array of strings | Optional. Comma-separated or array; e.g. `["history", "food"]` | Interests for feed preferences (MVP3). |
| `preferredDestinations` | array of strings | Optional. Comma-separated or array; e.g. `["Paris", "Tokyo"]` | Preferred destinations for feed (MVP3). |

#### Response (200 OK)

```json
{
  "id": "dev-user-00000000-0000-0000-0000-000000000001",
  "email": "dev@tripmaker.com",
  "phone": "+1 416 555 1234",
  "country": "Canada",
  "language": "en",
  "currencyType": "CAD",
  "createdAt": "2026-01-30T16:00:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": "Email must be provided."
}
```

**404 Not Found** - User doesn't exist
```json
{
  "error": "User not found."
}
```

**409 Conflict** - Email already taken
```json
{
  "error": "Email is already registered."
}
```

**500 Internal Server Error**
```json
{
  "error": "Profile update failed",
  "message": "Detailed error message"
}
```

---

## Data Models

### User Object

```typescript
interface User {
  id: string;                    // UUID v4
  email: string;                 // Normalized lowercase, unique
  passwordHash: string;          // scrypt hash (salt:hash format)
  trips: Trip[];                 // Saved trips
  profile: Profile;              // User profile data
  createdAt: string;             // ISO 8601 timestamp
}
```

### Trip Object

```typescript
interface Trip {
  id: string;                    // UUID v4
  userId: string;                // Owner user ID
  name: string;                  // Trip name
  destination: string;           // Destination
  days: number;                  // 1-10
  pace: 'relaxed' | 'balanced' | 'fast';
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  itinerary: Array<Record<string, unknown>>;
  transportMode?: 'flight' | 'train' | 'bus';  // MVP2: how user gets there
  isPublic?: boolean;            // MVP2: shown in public feed
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### Profile Object

```typescript
interface Profile {
  phone: string;                 // Free text, optional
  country: string;               // Free text, optional
  language: Language;            // UI language preference
  currencyType: Currency;        // Preferred currency
}

type Language = 'en' | 'hi' | 'ml' | 'ar' | 'es' | 'de';
type Currency = 'USD' | 'EUR' | 'INR' | 'AED' | 'GBP' | 'CAD' | 'AUD';
```

### JWT Payload

```typescript
interface JWTPayload {
  id: string;                    // User ID
  email: string;                 // User email
  iat: number;                   // Issued at (Unix timestamp)
  exp: number;                   // Expires at (Unix timestamp)
}
```

### Error Response

```typescript
interface ErrorResponse {
  error: string;                 // Human-readable error message
  message?: string;              // Detailed error (optional)
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST (registration) |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Invalid credentials |
| 404 | Not Found | Resource doesn't exist |
| 405 | Method Not Allowed | Wrong HTTP method |
| 409 | Conflict | Duplicate resource (email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Error Message Format

```json
{
  "error": "User-friendly error message",
  "message": "Technical details (optional)"
}
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Email and password are required." | Missing credentials | Provide both fields |
| "Invalid credentials." | Wrong email/password | Check credentials |
| "Email is already registered." | Duplicate email | Use different email |
| "User not found." | Invalid user ID | Check user ID |
| "Email is already in use." | Email taken by another user | Use different email |
| "Too many requests." | Rate limit hit | Wait 15 minutes |

---

## Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| `/register` | 5 requests | 15 minutes | Prevent spam accounts |
| `/login` | 10 requests | 15 minutes | Prevent brute force |
| All others | 100 requests | 15 minutes | General protection |

### Rate Limit Response

**429 Too Many Requests**

```json
{
  "error": "Too many requests. Please try again in 15 minutes."
}
```

### Rate Limit Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1706645400
```

---

## Testing

### Test User (Auto-seeded)

Always available in both local and production:

```json
{
  "email": "dev@tripmaker.com",
  "password": "DevUser123!",
  "id": "dev-user-00000000-0000-0000-0000-000000000001"
}
```

### Test Scenarios

#### 1. Complete Registration Flow

```bash
# Register new user
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'

# Expected: 201 Created with user ID
```

#### 2. Login and Get Profile

```bash
# Login
RESPONSE=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@tripmaker.com",
    "password": "DevUser123!"
  }')

# Extract token and ID
TOKEN=$(echo $RESPONSE | jq -r '.token')
USER_ID=$(echo $RESPONSE | jq -r '.id')

# Get profile
curl http://localhost:3000/profile/$USER_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with profile data
```

#### 3. Update Profile

```bash
# (Assuming TOKEN and USER_ID from above)
curl -X PUT http://localhost:3000/profile/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1 555 999 8888",
    "country": "Canada",
    "language": "en",
    "currencyType": "CAD"
  }'

# Expected: 200 OK with updated profile
```

#### 4. Error Cases

```bash
# Invalid credentials
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrong"
  }'
# Expected: 401 Unauthorized

# Duplicate email
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@tripmaker.com",
    "password": "NewPass123!",
    "confirmPassword": "NewPass123!"
  }'
# Expected: 409 Conflict

# Missing fields
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Bad Request
```

### Using Swagger UI (Local Only)

1. Start backend: `npm run dev:backend`
2. Open: http://localhost:3000/api-docs
3. Click "Try it out" on any endpoint
4. Fill in parameters
5. Click "Execute"
6. View response

---

## API Design Principles

### RESTful Conventions
- **GET**: Retrieve resources (idempotent)
- **POST**: Create resources
- **PUT**: Update resources (idempotent)
- **DELETE**: Remove resources (not implemented)

### Response Consistency
- Always return JSON
- Always include meaningful status codes
- Always include error messages
- Never expose stack traces in production

### Security
- Rate limiting on all endpoints
- Input validation on all POST/PUT
- JWT for authentication
- CORS whitelist
- Helmet security headers

### Versioning
- Current version: 2.0.0
- No version in URL (yet)
- Breaking changes will require v3

---

## API Evolution

### Planned Endpoints

**Trips:**
- `POST /trips` - Create trip
- `GET /trips` - List user's trips
- `GET /trips/:id` - Get trip details
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip

**Invitations:**
- `POST /trips/:id/invites` - Invite user to trip
- `GET /invites` - List pending invites
- `PUT /invites/:id/accept` - Accept invite
- `DELETE /invites/:id` - Decline invite

**Itinerary:**
- `POST /trips/:id/items` - Add itinerary item
- `PUT /trips/:id/items/:itemId` - Update item
- `DELETE /trips/:id/items/:itemId` - Remove item
- `POST /trips/:id/items/:itemId/vote` - Vote on item

### Deprecated Endpoints

None (v2 is current)

---

## Support

### Documentation
- **OpenAPI Spec**: http://localhost:3000/api-docs (local)
- **Architecture**: See `APP_ARCHITECTURE.md`
- **Frontend Guide**: See `FRONTEND_GUIDE.md` (if exists)

### Troubleshooting
- Check backend is running: `curl http://localhost:3000/health`
- Verify CORS origins: Check `CORS_ORIGINS` env var
- **CORS methods:** Backend must allow `GET`, `POST`, `PUT`, `PATCH`, `DELETE` (Archive uses PATCH). If Archive fails with "Failed to fetch" or CORS preflight error, add `PATCH` to CORS `methods` in `apps/backend/server.js`.
- Check rate limits: Wait 15 minutes if exceeded
- Verify JWT secret: Auto-generated in dev, required in prod

### Contributing
- Follow REST conventions
- Add Swagger docs for new endpoints
- Update this file with any API changes
- Test with curl before committing
- Use dev user for testing

---

**Maintained By:** TripMaker Development Team  
**Last Review:** January 30, 2026  
**Next Review:** February 15, 2026
