# API Quick Reference for Backend Developers

## ⚠️ IMPORTANT: Backend Has Been Updated

**This quick reference describes the ORIGINAL API (pre-JWT).**

### 🎯 Use Swagger as Source of Truth

The backend now has comprehensive Swagger documentation that supersedes this document:

- **Swagger UI:** https://trip-maker-web-be.vercel.app/api-docs
- **Local Dev:** http://localhost:3000/api-docs

### 📖 For Current Implementation

- **Swagger Documentation** - Always up-to-date, interactive
- **Migration Guide** - `TripMakerWeb-BE/FRONTEND_MIGRATION_GUIDE.md`
- **Migration Notice** - [MIGRATION_NOTICE.md](./MIGRATION_NOTICE.md)

### Key Updates in Backend
- ✅ JWT authentication (tokens returned with login/register)
- ✅ Authorization headers supported (optional)
- ✅ Enhanced security and validation
- ✅ Backward compatible (old frontend still works)

---

## Original API Reference (Pre-JWT)

This is a condensed reference for the **original** backend API contract. For detailed information, see [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md).

**For current JWT-based API, see Swagger documentation linked above.**

---

## Base URL

**Production:** `https://trip-maker-web-be.vercel.app`  
**Development:** Set via `VITE_API_BASE_URL` environment variable

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user | No |
| GET | `/profile/:userId` | Fetch user profile | No* |
| PUT | `/profile/:userId` | Update user profile | No* |

*Note: Currently no token-based auth. Frontend passes userId from localStorage.

---

## Detailed Endpoint Specifications

### POST /register

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response (200-299):**
```json
{
  "id": "user-unique-id",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400` - Missing email or password
- `409` - Email already registered
- `500` - Server error

---

### POST /login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response (200-299):**
```json
{
  "id": "user-unique-id",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

### GET /profile/:userId

**URL Parameters:**
- `userId` - The user's unique ID

**Success Response (200-299):**
```json
{
  "id": "user-unique-id",
  "email": "user@example.com",
  "phone": "+1 555 000 0000",
  "country": "United States",
  "language": "en",
  "currencyType": "USD"
}
```

**Field Requirements:**
- `id` (string, required) - User ID
- `email` (string, required) - User email
- `phone` (string, optional) - Phone number
- `country` (string, optional) - Country name
- `language` (string, optional) - Language code (en/hi/ml/ar/es/de)
- `currencyType` (string, optional) - Currency code (USD/EUR/INR/AED/GBP/CAD/AUD)

**Error Responses:**
- `404` - User not found
- `500` - Server error

---

### PUT /profile/:userId

**URL Parameters:**
- `userId` - The user's unique ID

**Request:**
```json
{
  "email": "user@example.com",
  "phone": "+1 555 000 0000",
  "country": "United States",
  "language": "en",
  "currencyType": "USD"
}
```

**Success Response (200-299):**
```json
{
  "id": "user-unique-id",
  "email": "user@example.com",
  "phone": "+1 555 000 0000",
  "country": "United States",
  "language": "en",
  "currencyType": "USD"
}
```

**Error Responses:**
- `400` - Invalid request data
- `404` - User not found
- `500` - Server error

---

## Error Response Format

Backend should return error information in one of these formats:

```json
{
  "error": "Human-readable error message"
}
```

or

```json
{
  "message": "Human-readable error message"
}
```

Frontend will display the `error` or `message` field to the user. If neither is provided, it falls back to generic messages based on HTTP status code.

---

## CORS Configuration

**Required Headers:**

```
Access-Control-Allow-Origin: https://trip-maker-web.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

For local development:
```
Access-Control-Allow-Origin: http://localhost:5173
```

---

## HTTP Status Code Mapping

Frontend interprets status codes as follows:

| Status Code | Frontend Interpretation |
|-------------|------------------------|
| 200-299 | Success |
| 400 | "Email and password are required." |
| 401 | "The email or password is incorrect." |
| 409 | "That email is already registered." |
| Other | Uses `error`/`message` from response or generic fallback |

---

## Frontend Data Flow

### Registration
1. User submits form → `POST /register`
2. Backend returns `{ id, email }`
3. Frontend saves to localStorage as `waypoint.user`
4. Redirect to `/home`

### Login
1. User submits form → `POST /login`
2. Backend returns `{ id, email }`
3. Frontend saves to localStorage as `waypoint.user`
4. Frontend calls `GET /profile/:userId`
5. Backend returns profile data
6. Frontend saves to localStorage as `waypoint.profile`
7. Frontend applies user's language preference
8. Redirect to `/home`

### Profile Update
1. User edits profile → `PUT /profile/:userId`
2. Backend returns updated profile
3. Frontend updates localStorage `waypoint.profile`
4. Frontend applies language change if updated
5. Success message shown

---

## Testing Checklist

When implementing or modifying backend endpoints:

- [ ] Endpoint returns correct response format
- [ ] Appropriate HTTP status codes used
- [ ] CORS headers included in response
- [ ] Error responses include `error` or `message` field
- [ ] Profile endpoint returns all expected fields
- [ ] Login/register returns `id` and `email`
- [ ] Optional profile fields (phone, country) handled correctly
- [ ] Tested with frontend running on `http://localhost:5173`

---

## Common Integration Issues

### Issue: CORS errors in browser console
**Solution:** Add CORS headers to all responses, including errors. Handle OPTIONS preflight requests.

### Issue: Frontend shows "Unable to log you in"
**Solution:** Check that response format matches expected format. Verify status code is 2xx for success.

### Issue: Profile not loading after login
**Solution:** Ensure `GET /profile/:userId` returns all required fields (`id`, `email` at minimum).

### Issue: Frontend language not persisting
**Solution:** Verify `language` field in profile is being saved and returned correctly.

### Issue: Login works but profile shows default values
**Solution:** Check that optional fields are returned as empty strings or null (not omitted) from profile endpoint.

---

## Frontend Service Functions

Backend developers can search for these function names in frontend code:

| Function | File | Endpoint Called |
|----------|------|-----------------|
| `registerUser()` | `src/services/auth.js` | `POST /register` |
| `loginUser()` | `src/services/auth.js` | `POST /login` |
| `fetchProfile()` | `src/services/profile.js` | `GET /profile/:userId` |
| `updateProfile()` | `src/services/profile.js` | `PUT /profile/:userId` |

---

## Development Setup

**Start frontend:**
```bash
cd TripMakerWeb
npm install
npm run dev
# Runs on http://localhost:5173
```

**Configure backend URL for local development:**

Create `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:3000
```

Then restart the dev server.

---

## Quick Debugging Commands

**Check what frontend is sending:**
1. Open browser DevTools → Network tab
2. Perform action (login/register/save profile)
3. Check request payload and headers

**Check localStorage:**
```javascript
// In browser console
localStorage.getItem('waypoint.user')
localStorage.getItem('waypoint.profile')
localStorage.getItem('waypoint.language')
```

**Clear session:**
```javascript
// In browser console
localStorage.removeItem('waypoint.user')
localStorage.removeItem('waypoint.profile')
location.reload()
```

---

## Need More Details?

See [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) for:
- Complete architecture overview
- Detailed authentication flow diagrams
- Component hierarchy
- Error handling strategies
- Internationalization setup
- Routing configuration
- And much more...
