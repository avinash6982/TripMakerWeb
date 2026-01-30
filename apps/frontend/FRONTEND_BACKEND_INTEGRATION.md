# Frontend-Backend Integration Documentation

## ⚠️ IMPORTANT NOTICE

**This documentation describes the ORIGINAL API contract (pre-JWT).** 

The backend has been upgraded to include JWT authentication. While the backend maintains backward compatibility, **migration is recommended**.

### 🎯 Single Source of Truth: Swagger API Documentation

For the most current and accurate API contracts, always refer to the **Swagger documentation**:

- **Production Swagger UI:** https://trip-maker-web-be.vercel.app/api-docs
- **Local Dev Swagger UI:** http://localhost:3000/api-docs
- **OpenAPI Spec:** https://trip-maker-web-be.vercel.app/api-docs.json

### 📖 Migration Resources

- **Migration Guide:** `/Users/avinash1/Documents/projects/cursor_agent/TripMakerWeb-BE/FRONTEND_MIGRATION_GUIDE.md`
- **Migration Notice:** [MIGRATION_NOTICE.md](./MIGRATION_NOTICE.md)

**Key Changes in New Backend:**
- Registration returns: `{ id, email, token }`
- Login returns: `{ id, email, token, message }`
- Profile endpoints now support (optional) JWT token via `Authorization` header

---

## Overview

This document describes how the **Waypoint** frontend works and integrates with the backend. It's designed to help backend developers understand the existing frontend implementation, API contracts, data flow, and integration patterns.

**Note:** This document reflects the original implementation. For JWT-based integration, refer to the Swagger docs and migration guide mentioned above.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Authentication Flow](#authentication-flow)
4. [API Integration Patterns](#api-integration-patterns)
5. [Backend API Contract](#backend-api-contract)
6. [Data Storage & Session Management](#data-storage--session-management)
7. [Routing Structure](#routing-structure)
8. [Error Handling](#error-handling)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [Environment Configuration](#environment-configuration)
11. [Key Frontend Files](#key-frontend-files)

---

## Technology Stack

### Frontend Technologies
- **Framework:** React 19.2.3
- **Build Tool:** Vite 7.3.1
- **Routing:** React Router DOM 7.12.0
- **Internationalization:** i18next 25.8.0 + react-i18next 16.5.3
- **Styling:** CSS (vanilla, located in `src/index.css`)

### Supported Languages
- English (en)
- Hindi (hi)
- Malayalam (ml)
- Arabic (ar)
- Spanish (es)
- German (de)

---

## Architecture Overview

The frontend follows a **Single Page Application (SPA)** architecture:

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root component with routing logic
├── i18n.js               # Internationalization configuration
├── index.css             # Global styles
├── layouts/
│   ├── AuthLayout.jsx    # Layout for unauthenticated pages (login/register)
│   └── SiteLayout.jsx    # Layout for authenticated pages (home/profile)
├── pages/
│   ├── Home.jsx          # Main dashboard (authenticated)
│   ├── Login.jsx         # Login page
│   ├── Register.jsx      # Registration page
│   └── Profile.jsx       # User profile settings page
└── services/
    ├── auth.js           # Authentication service & API calls
    └── profile.js        # Profile service & API calls
```

### Component Hierarchy

```
main.jsx
  └── App.jsx
      ├── AuthLayout (unauthenticated routes)
      │   ├── Login
      │   └── Register
      └── SiteLayout (authenticated routes)
          ├── Home
          └── Profile (with RequireAuth wrapper)
```

---

## Authentication Flow

### Registration Flow

1. **User submits registration form** (`/register`)
   - Frontend collects: `email`, `password`, `confirmPassword`
   - Validates passwords match
   - Calls `POST /register` endpoint

2. **Backend processes registration**
   - Creates user account
   - Returns user object: `{ id, email }`

3. **Frontend stores user data**
   - Saves user to localStorage (`waypoint.user`)
   - Redirects to `/home`

### Login Flow

1. **User submits login form** (`/login`)
   - Frontend collects: `email`, `password`
   - Calls `POST /login` endpoint

2. **Backend authenticates user**
   - Validates credentials
   - Returns user object: `{ id, email }`

3. **Frontend processes login**
   - Saves user to localStorage (`waypoint.user`)
   - Fetches user profile via `GET /profile/:userId`
   - Saves profile to localStorage (`waypoint.profile`)
   - Applies user's preferred language from profile
   - Redirects to `/home`

### Session Persistence

- **Storage:** Browser `localStorage`
- **User Key:** `waypoint.user`
- **Profile Key:** `waypoint.profile`
- **No server-side sessions or tokens** (currently)
- User remains logged in until they explicitly log out or clear localStorage

### Logout Flow

1. User clicks logout button
2. Frontend clears both `waypoint.user` and `waypoint.profile` from localStorage
3. Fires `authchange` event
4. Redirects to `/login`

---

## API Integration Patterns

### Base Configuration

Located in `src/services/auth.js`:

```javascript
const DEFAULT_API_BASE = "https://trip-maker-web-be.vercel.app";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");
```

- Default backend: `https://trip-maker-web-be.vercel.app`
- Can be overridden with environment variable: `VITE_API_BASE_URL`
- Trailing slashes are automatically removed

### Request Helper Function

All API calls use a centralized `requestJson` function:

```javascript
const requestJson = async (path, options, fallbackMessage) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, data, fallbackMessage));
  }

  return data;
};
```

**Features:**
- Handles JSON parsing
- Error handling based on HTTP status codes
- Throws errors for non-2xx responses
- Falls back to generic error messages

### Error Message Mapping

The frontend has built-in error message handling:

| HTTP Status | Error Message |
|-------------|---------------|
| 400 | "Email and password are required." |
| 401 | "The email or password is incorrect." |
| 409 | "That email is already registered." |
| Other | Uses `data.error`, `data.message`, or fallback message |

---

## Backend API Contract

### Required Endpoints

#### 1. **POST /register**

**Purpose:** Create a new user account

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response (2xx):**
```json
{
  "id": "user-unique-id",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `409 Conflict` - Email already exists
- `500 Internal Server Error` - Server error

---

#### 2. **POST /login**

**Purpose:** Authenticate existing user

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response (2xx):**
```json
{
  "id": "user-unique-id",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

#### 3. **GET /profile/:userId**

**Purpose:** Fetch user profile settings

**URL Parameters:**
- `userId` - The unique user ID

**Success Response (2xx):**
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

**Notes:**
- All profile fields except `id` and `email` are optional
- Frontend has defaults: `language: "en"`, `currencyType: "USD"`

**Error Responses:**
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

#### 4. **PUT /profile/:userId**

**Purpose:** Update user profile settings

**URL Parameters:**
- `userId` - The unique user ID

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+1 555 000 0000",
  "country": "United States",
  "language": "en",
  "currencyType": "USD"
}
```

**Success Response (2xx):**
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

**Notes:**
- Frontend sends all profile fields (even if unchanged)
- Fields are trimmed before sending
- Updated profile is saved to localStorage

**Error Responses:**
- `400 Bad Request` - Invalid data
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### CORS Configuration

**Required CORS Headers:**

The backend must allow requests from the frontend origin:

```
Access-Control-Allow-Origin: https://trip-maker-web.vercel.app (or specific frontend URL)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

For development:
```
Access-Control-Allow-Origin: http://localhost:5173
```

---

## Data Storage & Session Management

### LocalStorage Schema

#### User Storage (`waypoint.user`)

```json
{
  "id": "user-unique-id",
  "email": "user@example.com"
}
```

**Usage:**
- Stored after successful login/registration
- Cleared on logout
- Used for authentication checks (presence of this object determines if user is logged in)

#### Profile Storage (`waypoint.profile`)

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

**Usage:**
- Cached profile data
- Loaded after login to avoid extra API calls
- Updated when user saves profile changes
- Used to pre-fill profile form

#### Language Storage (`waypoint.language`)

```json
"en"
```

**Usage:**
- Stores user's current language preference
- Automatically updated when language changes
- Used to restore language on page reload

### Custom Events

The frontend uses a custom `authchange` event to notify components when authentication state changes:

```javascript
// Fired when user logs in
setStoredUser(user);
window.dispatchEvent(new Event("authchange"));

// Fired when user logs out
clearStoredUser();
window.dispatchEvent(new Event("authchange"));
```

**Components listening:**
- `SiteLayout` - Updates user state in header
- `Profile` - Refreshes user data

---

## Routing Structure

### Route Configuration

| Route | Layout | Component | Auth Required | Description |
|-------|--------|-----------|---------------|-------------|
| `/` | AuthLayout | Login | No | Landing page (redirects to `/login`) |
| `/login` | AuthLayout | Login | No | User login form |
| `/register` | AuthLayout | Register | No | User registration form |
| `/home` | SiteLayout | Home | Yes | Main dashboard |
| `/profile` | SiteLayout | Profile | Yes | User profile settings |
| `*` (catch-all) | - | Navigate to `/` | - | Redirects unknown routes to home |

### Auth Protection

**RequireAuth Wrapper:**
```javascript
const RequireAuth = ({ children }) => {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
```

- Checks for `waypoint.user` in localStorage
- Redirects to `/login` if not authenticated
- Used to protect `/home` and `/profile` routes

### Redirect Logic

**If authenticated:**
- Visiting `/login` or `/register` → Auto-redirect to `/home`

**If not authenticated:**
- Visiting `/home` or `/profile` → Auto-redirect to `/login`

---

## Error Handling

### Client-Side Validation

#### Registration Page
- Validates `email` and `password` are not empty
- Validates `password` matches `confirmPassword`
- Shows error message: "Passwords do not match." or "Email and password are required."

#### Login Page
- Validates `email` and `password` are not empty
- Shows error message: "Email and password are required."

#### Profile Page
- Email field is required
- Phone, country optional
- Language and currency have defaults

### Server Error Handling

Frontend displays errors in UI using status messages:

```javascript
try {
  // API call
  setStatus("success");
  setMessage("Operation successful");
} catch (error) {
  setStatus("error");
  setMessage(error.message); // From backend or fallback
}
```

**Error Message Display:**
- Shown in colored message boxes
- Red for errors
- Green for success
- Automatically shown after form submission

### Network Error Fallbacks

If backend is unreachable:
- Fetch throws network error
- Frontend shows generic message from fallback
- Example: "Unable to log you in right now."

---

## Internationalization (i18n)

### Configuration

Located in `src/i18n.js`:

- **Library:** i18next + react-i18next
- **Supported Languages:** en, hi, ml, ar, es, de
- **Fallback Language:** English (en)
- **Storage:** localStorage (`waypoint.language`)
- **RTL Support:** Automatic for Arabic (ar)

### Language Switching

**User Triggers:**
1. **Global Language Selector** (in header)
   - Available on all pages
   - Dropdown with language options
   - Changes UI language immediately

2. **Profile Settings**
   - User can set preferred language in profile
   - Saved to backend
   - Applied on login

**Implementation:**
```javascript
i18n.changeLanguage(languageCode);
// Automatically updates localStorage and document lang/dir attributes
```

### Translation Keys

All UI text uses translation keys:

```javascript
t("auth.login.title") // "Log in to keep planning together."
t("profile.form.email") // "Email"
t("languages.en") // "English"
```

**Key Namespaces:**
- `nav.*` - Navigation links
- `actions.*` - Button labels
- `auth.*` - Authentication pages
- `profile.*` - Profile page
- `languages.*` - Language names

---

## Environment Configuration

### Build Configuration (`vite.config.js`)

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

### Environment Variables

Create `.env` file in project root:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

**Usage in code:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE;
```

**Note:** All Vite environment variables must be prefixed with `VITE_`

### Development Server

```bash
npm run dev
# Runs on http://localhost:5173
```

### Production Build

```bash
npm run build
# Output: dist/
```

---

## Key Frontend Files

### 1. `src/services/auth.js`

**Responsibilities:**
- API base URL configuration
- User authentication API calls (`loginUser`, `registerUser`)
- LocalStorage management (`getStoredUser`, `setStoredUser`, `clearStoredUser`)
- Error message mapping
- Centralized request handler (`requestJson`)

**Key Functions:**
```javascript
registerUser(payload)      // POST /register
loginUser(payload)         // POST /login
getStoredUser()            // Read from localStorage
setStoredUser(user)        // Write to localStorage
clearStoredUser()          // Clear localStorage
```

---

### 2. `src/services/profile.js`

**Responsibilities:**
- Profile API calls
- Profile localStorage management

**Key Functions:**
```javascript
fetchProfile(userId)           // GET /profile/:userId
updateProfile(userId, payload) // PUT /profile/:userId
getStoredProfile()             // Read from localStorage
saveProfile(profile)           // Write to localStorage
clearStoredProfile()           // Clear localStorage
```

---

### 3. `src/App.jsx`

**Responsibilities:**
- Route configuration
- Authentication wrapper (`RequireAuth`)
- Layout assignment for routes

**Route Structure:**
```javascript
<Routes>
  <Route element={<AuthLayout />}>
    <Route index element={<Login />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
  </Route>
  <Route element={<SiteLayout />}>
    <Route path="home" element={<RequireAuth><Home /></RequireAuth>} />
    <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

### 4. `src/layouts/AuthLayout.jsx`

**Responsibilities:**
- Layout for unauthenticated pages (login/register)
- Language selector in header
- Redirects authenticated users to `/home`
- Contains app branding/logo

---

### 5. `src/layouts/SiteLayout.jsx`

**Responsibilities:**
- Layout for authenticated pages
- Site navigation (Home, Profile links)
- User info display
- Logout button
- Language selector
- Listens to `authchange` events

---

### 6. `src/pages/Login.jsx`

**Flow:**
1. Checks if user already logged in → redirect to `/home`
2. Displays login form (email, password)
3. Validates form inputs
4. Calls `loginUser()` API
5. Stores user data
6. Fetches and caches profile
7. Applies user's language preference
8. Redirects to `/home`

---

### 7. `src/pages/Register.jsx`

**Flow:**
1. Checks if user already logged in → redirect to `/home`
2. Displays registration form (email, password, confirmPassword)
3. Validates passwords match
4. Calls `registerUser()` API
5. Stores user data
6. Redirects to `/home`

---

### 8. `src/pages/Profile.jsx`

**Flow:**
1. Checks authentication
2. Loads cached profile from localStorage (if available)
3. Fetches fresh profile from backend via `GET /profile/:userId`
4. Pre-fills form with profile data
5. User edits fields
6. User saves → calls `PUT /profile/:userId`
7. Updates localStorage cache
8. Applies language change if updated

**Profile Form Fields:**
- Email (required, shown from user object)
- Phone (optional)
- Country (dropdown, optional)
- Language (dropdown, required, default: "en")
- Currency (dropdown, required, default: "USD")

**Supported Countries:**
- United States, India, United Kingdom, United Arab Emirates, Spain, Germany, Canada, Australia

**Supported Currencies:**
- USD, EUR, INR, AED, GBP, CAD, AUD

---

### 9. `src/pages/Home.jsx`

**Responsibilities:**
- Main dashboard after login
- Protected by `RequireAuth`
- Currently a placeholder for future trip features
- Displays welcome message

---

## Backend Development Guidelines

### When Adding New Features

1. **Add API Endpoints:**
   - Follow RESTful conventions
   - Return JSON responses
   - Use appropriate HTTP status codes
   - Include CORS headers

2. **Update Frontend Services:**
   - Add new API call functions in `src/services/`
   - Use existing `requestJson` helper for consistency
   - Handle errors appropriately

3. **Update Components:**
   - Fetch data in `useEffect` hooks
   - Show loading states
   - Display errors to users

### Testing Backend Changes

1. **Manual Testing:**
   ```bash
   # Frontend (terminal 1)
   cd TripMakerWeb
   npm run dev
   
   # Backend (terminal 2)
   cd TripMakerWeb-BE
   npm run dev
   ```

2. **Set API URL:**
   ```bash
   # In TripMakerWeb/.env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Test Flows:**
   - Register new user
   - Login with user
   - Update profile
   - Check localStorage data
   - Check network tab for API calls

### Common Backend Issues

1. **CORS Errors:**
   - Ensure backend allows frontend origin
   - Include all required headers
   - Handle OPTIONS preflight requests

2. **Response Format Mismatch:**
   - Frontend expects `{ id, email }` from login/register
   - Profile endpoints must return full profile object
   - Error responses should include `error` or `message` field

3. **HTTP Status Codes:**
   - Use 400 for validation errors
   - Use 401 for authentication failures
   - Use 409 for conflicts (e.g., duplicate email)
   - Use 404 for not found
   - Use 500 for server errors

---

## Future Considerations

### Potential Enhancements

1. **Authentication:**
   - Add JWT tokens or session cookies
   - Implement token refresh mechanism
   - Add password reset flow
   - Add email verification

2. **Profile Features:**
   - Profile picture upload
   - More user preferences
   - Account deletion
   - Privacy settings

3. **Trip Features:**
   - Create/manage trips
   - Invite collaborators
   - Share itineraries
   - Budget tracking

4. **Real-time Updates:**
   - WebSocket integration
   - Live collaboration features
   - Push notifications

---

## Summary

The Waypoint frontend is a React SPA that communicates with a RESTful backend API. Key points:

- **Authentication:** Email/password stored in localStorage (no tokens currently)
- **API Base:** `https://trip-maker-web-be.vercel.app` (configurable via env var)
- **Endpoints:** `/register`, `/login`, `/profile/:userId` (GET/PUT)
- **Data Format:** JSON requests and responses
- **Error Handling:** HTTP status codes with error messages
- **Languages:** 6 languages supported with i18next
- **Routing:** React Router with protected routes
- **State:** localStorage for user session and profile cache

**For Backend Developers:**
- Maintain the existing API contract
- Ensure CORS is properly configured
- Return consistent JSON response formats
- Use appropriate HTTP status codes
- Test integration with the frontend after changes

---

## Contact & Support

**Frontend Repository:** TripMakerWeb  
**Backend Repository:** TripMakerWeb-BE  
**Deployment:** Vercel (both frontend and backend)

For questions or issues with the integration, refer to this document first, then consult the `MASTER_DOC.md` for product-level context.
