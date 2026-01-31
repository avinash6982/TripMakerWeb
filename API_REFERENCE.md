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

Returns public trips from all users. No auth required.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `destination` | string | Optional. Filter by destination (partial match). |
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

Returns trip if owned by user OR if trip is public. Public trips include `ownerEmail`.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Trip ID |

#### Response (200 OK)

Returns the full trip object (same shape as Create Trip response). Public trips include `ownerEmail`.

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

#### Response (200 OK)

Returns the updated trip object.

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
    "currencyType": "CAD"
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
