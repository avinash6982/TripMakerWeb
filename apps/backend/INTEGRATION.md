# Integration Guide

> **⚠️ IMPORTANT:** This documentation is maintained for reference, but the **Swagger API Documentation** is the single source of truth.
> 
> **Access Swagger:**
> - **Production:** https://trip-maker-web-be.vercel.app/api-docs
> - **Local:** http://localhost:3000/api-docs
>
> For frontend migration instructions, see [FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md)

---

This backend provides JWT-authenticated register and login functionality using
file-based storage (no external database). Update this file whenever
endpoints, payloads, or configuration change.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm run start
   ```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Port used by the HTTP server. |
| `NODE_ENV` | `development` | Environment mode (development/production). |
| `USER_DB_PATH` | `data/users.json` | Path to the JSON file that stores users. |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed origins or `*`. |
| `JWT_SECRET` | *(required)* | Secret key for JWT token signing (min 32 chars). |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration time (e.g., 7d, 24h, 60m). |

The users file is created automatically if it does not exist. When running on
Vercel, the filesystem is read-only, so the server defaults to
`/tmp/tripmaker-users.json` (ephemeral). Set `USER_DB_PATH` explicitly if you
want a different writable location.

## CORS

If the frontend runs on another origin, allow it via `CORS_ORIGINS`:

```
CORS_ORIGINS=https://trip-maker-web.vercel.app
```

## Data Storage Format

Users are stored as an array in the JSON file:

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "passwordHash": "salt:hash",
    "profile": {
      "phone": "",
      "country": "",
      "language": "en",
      "currencyType": "USD"
    },
    "createdAt": "2026-01-20T12:34:56.000Z"
  }
]
```

## API Endpoints

### `POST /register`

Create a new user account.

> **📚 See detailed documentation in Swagger:** http://localhost:3000/api-docs

**Request**
```json
{
  "email": "user@example.com",
  "password": "plain-text-password"
}
```

**Success Response (201)**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "createdAt": "2026-01-20T12:34:56.000Z"
}
```

**Error Responses**
- `400` if email or password is missing, or validation fails.
- `409` if the email is already registered.
- `429` if rate limit exceeded (5 requests per 15 minutes).

### `POST /login`

Validate credentials and return user info with JWT token.

> **📚 See detailed documentation in Swagger:** http://localhost:3000/api-docs

**Request**
```json
{
  "email": "user@example.com",
  "password": "plain-text-password"
}
```

**Success Response (200)**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful."
}
```

**Error Responses**
- `400` if email or password is missing.
- `401` if credentials are invalid.
- `429` if rate limit exceeded (10 requests per 15 minutes).

### `GET /health`

Returns server status.

**Response (200)**
```json
{ "status": "ok" }
```

### `GET /profile/:id`

Fetch a user's profile by user id. Authentication is optional but recommended.

> **📚 See detailed documentation in Swagger:** http://localhost:3000/api-docs

**Request Headers (Optional)**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200)**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "",
  "country": "",
  "language": "en",
  "currencyType": "USD",
  "createdAt": "2026-01-20T12:34:56.000Z"
}
```

**Error Responses**
- `404` if the user is not found.

### `PUT /profile/:id`

Update profile fields and/or email. Authentication is optional but recommended.

> **📚 See detailed documentation in Swagger:** http://localhost:3000/api-docs

**Request Headers (Optional)**
```
Authorization: Bearer <jwt_token>
```

**Request**
```json
{
  "email": "new@example.com",
  "phone": "+1 555 0100",
  "country": "US",
  "language": "en",
  "currencyType": "USD"
}
```

All fields are optional. Missing fields keep their current values.

**Success Response (200)**
```json
{
  "id": "uuid",
  "email": "new@example.com",
  "phone": "+1 555 0100",
  "country": "US",
  "language": "en",
  "currencyType": "USD",
  "createdAt": "2026-01-20T12:34:56.000Z"
}
```

**Error Responses**
- `400` if email is provided but empty after normalization.
- `404` if the user is not found.
- `409` if the email is already registered to another user.

## Example Usage

> **💡 TIP:** Use the interactive Swagger UI to test endpoints: http://localhost:3000/api-docs

Register:
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"my-secret"}'
```

Login:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"my-secret"}'
```

Get Profile (with token):
```bash
curl -X GET http://localhost:3000/profile/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Update Profile (with token):
```bash
curl -X PUT http://localhost:3000/profile/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"phone":"+1 555 000 0000","language":"es"}'
```

---

## Security Features

### JWT Authentication

The API now uses JWT (JSON Web Tokens) for authentication:

- **Token Generation:** Tokens are issued on registration and login
- **Token Expiration:** Default 7 days (configurable via `JWT_EXPIRES_IN`)
- **Token Format:** `Authorization: Bearer <token>`

### Rate Limiting

Protection against abuse with the following limits:

- **Registration:** 5 requests per 15 minutes per IP
- **Login:** 10 requests per 15 minutes per IP  
- **Other endpoints:** 100 requests per 15 minutes per IP

### Input Validation

Server-side validation for all inputs:

- Email format validation
- Password minimum length (6 characters)
- Field type validation
- Language and currency enum validation

### Security Headers

Using Helmet.js for security headers:

- XSS Protection
- Content Security Policy
- DNS Prefetch Control
- Frameguard
- And more...

---

## For Frontend Developers

If you're integrating this backend with the TripMakerWeb frontend, see:

📖 **[FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md)** - Complete migration guide with code examples
