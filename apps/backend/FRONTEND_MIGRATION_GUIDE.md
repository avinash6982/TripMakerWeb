# Frontend Migration Guide - JWT Authentication & Swagger Integration

## 📋 Overview

This guide provides step-by-step instructions to update the **TripMakerWeb** frontend to work with the enhanced backend that now includes:

- ✅ **JWT Token Authentication** (backward compatible)
- ✅ **Swagger API Documentation** (single source of truth)
- ✅ **Enhanced Security** (helmet, rate limiting, CORS)
- ✅ **Input Validation** (server-side validation)
- ✅ **Better Error Handling**

---

## 🎯 Single Source of Truth: Swagger

**IMPORTANT:** The backend now exposes a comprehensive Swagger API documentation that should be used as the single source of truth for all API integrations.

### Swagger URLs

| Environment | Swagger UI | Swagger JSON |
|-------------|------------|--------------|
| **Production** | `https://trip-maker-web-be.vercel.app/api-docs` | `https://trip-maker-web-be.vercel.app/api-docs.json` |
| **Local Dev** | `http://localhost:3000/api-docs` | `http://localhost:3000/api-docs.json` |

### Why Swagger?

1. **Always Up-to-Date**: Swagger is generated from the actual backend code
2. **Interactive Testing**: Test endpoints directly from the browser
3. **Complete Documentation**: All request/response schemas, examples, and error codes
4. **Type Safety**: Can generate TypeScript types from Swagger spec
5. **No More Guesswork**: Clear contracts for all endpoints

---

## 🚀 Quick Start

### Step 1: Visit Swagger Documentation

Before making any changes, familiarize yourself with the new API:

1. Start the backend: `npm run dev` (in TripMakerWeb-BE)
2. Open browser: `http://localhost:3000/api-docs`
3. Explore all endpoints, schemas, and examples

### Step 2: Understand Changes

The backend is **backward compatible** but adds new features:

| Feature | Old Behavior | New Behavior |
|---------|-------------|--------------|
| **Registration** | Returns `{ id, email }` | Returns `{ id, email, token }` |
| **Login** | Returns `{ id, email, message }` | Returns `{ id, email, token, message }` |
| **Profile GET** | No auth required | Optional auth (works with or without token) |
| **Profile PUT** | No auth required | Optional auth (recommended to use token) |

---

## 📝 Required Frontend Changes

### Change 1: Update Auth Service to Handle JWT Tokens

**File:** `src/services/auth.js`

#### 1.1 Add Token Storage Functions

Add these new functions after the existing user storage functions:

```javascript
// Token management
export const getStoredToken = () => {
  try {
    return localStorage.getItem("waypoint.token");
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    localStorage.setItem("waypoint.token", token);
  } catch (error) {
    console.error("Failed to store token:", error);
  }
};

export const clearStoredToken = () => {
  try {
    localStorage.removeItem("waypoint.token");
  } catch (error) {
    console.error("Failed to clear token:", error);
  }
};
```

#### 1.2 Update `clearStoredUser` to Clear Token

Modify the existing `clearStoredUser` function:

```javascript
export const clearStoredUser = () => {
  try {
    localStorage.removeItem("waypoint.user");
    localStorage.removeItem("waypoint.token"); // Add this line
    window.dispatchEvent(new Event("authchange"));
  } catch (error) {
    console.error("Failed to clear user:", error);
  }
};
```

#### 1.3 Update `registerUser` to Store Token

Modify the existing `registerUser` function to store the token:

```javascript
export const registerUser = async (payload) => {
  const data = await requestJson(
    "/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Unable to create your account right now."
  );

  // Store user
  setStoredUser({
    id: data.id,
    email: data.email,
  });

  // Store token (NEW)
  if (data.token) {
    setStoredToken(data.token);
  }

  return data;
};
```

#### 1.4 Update `loginUser` to Store Token

Modify the existing `loginUser` function to store the token:

```javascript
export const loginUser = async (payload) => {
  const data = await requestJson(
    "/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Unable to log you in right now."
  );

  // Store user
  setStoredUser({
    id: data.id,
    email: data.email,
  });

  // Store token (NEW)
  if (data.token) {
    setStoredToken(data.token);
  }

  return data;
};
```

---

### Change 2: Update Profile Service to Send JWT Token

**File:** `src/services/profile.js`

#### 2.1 Import Token Function

Add this import at the top of the file:

```javascript
import { getStoredToken } from "./auth.js";
```

#### 2.2 Create Auth Headers Helper

Add this helper function before the `fetchProfile` function:

```javascript
const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
```

#### 2.3 Update `fetchProfile` to Send Token

Modify the `fetchProfile` function to use auth headers:

```javascript
export const fetchProfile = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(), // Changed from { "Content-Type": "application/json" }
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, data, "Unable to load your profile."));
  }

  return data;
};
```

#### 2.4 Update `updateProfile` to Send Token

Modify the `updateProfile` function to use auth headers:

```javascript
export const updateProfile = async (userId, payload) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(), // Changed from { "Content-Type": "application/json" }
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, data, "Unable to save your profile."));
  }

  return data;
};
```

---

### Change 3: Handle Token Expiration

**File:** `src/services/auth.js` or create a new file `src/services/tokenHandler.js`

Add this function to handle 401 (Unauthorized) errors globally:

```javascript
export const handleTokenExpiration = () => {
  // Clear all auth data
  clearStoredUser();
  clearStoredToken();
  
  // Redirect to login
  window.location.href = "/login";
};
```

Then update your error handling in `requestJson` function:

```javascript
const requestJson = async (path, options, fallbackMessage) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await parseJson(response);

  if (!response.ok) {
    // Handle token expiration
    if (response.status === 401 && path !== "/login" && path !== "/register") {
      handleTokenExpiration();
      throw new Error("Your session has expired. Please log in again.");
    }
    
    throw new Error(getErrorMessage(response.status, data, fallbackMessage));
  }

  return data;
};
```

Similarly, update the profile service error handling.

---

### Change 4: Update localStorage Schema

**No code changes needed**, but update your mental model and documentation:

#### New localStorage Keys

| Key | Value | Description |
|-----|-------|-------------|
| `waypoint.user` | `{ id, email }` | Basic user info (unchanged) |
| `waypoint.profile` | `{ id, email, phone, ... }` | Full profile (unchanged) |
| `waypoint.language` | `"en"` | Current language (unchanged) |
| `waypoint.token` | `"eyJhbGc..."` | **NEW:** JWT authentication token |

---

## 🔒 Security Best Practices

### 1. Always Send Token for Protected Routes

Although the backend currently makes auth optional for profile endpoints, you should **always send the token** when available for better security.

### 2. Handle Token Expiration Gracefully

Implement the token expiration handler (see Change 3) to automatically log out users when their token expires.

### 3. Clear Token on Logout

Always clear the token when the user logs out (already implemented in Change 1.2).

### 4. Don't Store Sensitive Data in localStorage

The token is safe to store in localStorage for this use case, but never store passwords or other sensitive data there.

---

## 📊 Testing Your Changes

### Test Checklist

Use this checklist to verify everything works:

#### Registration Flow
- [ ] Register a new user
- [ ] Verify `waypoint.token` is stored in localStorage
- [ ] Verify user is redirected to `/home`
- [ ] Check Network tab: response includes `token` field

#### Login Flow
- [ ] Login with existing user
- [ ] Verify `waypoint.token` is stored in localStorage
- [ ] Verify profile loads correctly
- [ ] Check Network tab: `/login` response includes `token`
- [ ] Check Network tab: `/profile/:id` request includes `Authorization` header

#### Profile Management
- [ ] View profile page
- [ ] Verify request includes `Authorization: Bearer <token>` header
- [ ] Update profile information
- [ ] Verify update request includes `Authorization` header
- [ ] Verify profile updates successfully

#### Logout Flow
- [ ] Click logout
- [ ] Verify `waypoint.token` is cleared from localStorage
- [ ] Verify user is redirected to `/login`

#### Token Expiration
- [ ] Manually delete or corrupt the token in localStorage
- [ ] Try to access a protected page
- [ ] Verify user is redirected to login (if 401 handler implemented)

#### Swagger Integration
- [ ] Visit `http://localhost:3000/api-docs`
- [ ] Try "Test" button on each endpoint
- [ ] Verify response formats match what frontend expects

---

## 🌐 Environment Configuration

### Update Frontend `.env` File

Your frontend `.env` should look like this:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000

# For production (in Vercel dashboard)
# VITE_API_BASE_URL=https://trip-maker-web-be.vercel.app
```

### Backend Environment Variables

Ensure your backend `.env` has these variables:

```bash
PORT=3000
NODE_ENV=development
USER_DB_PATH=data/users.json
CORS_ORIGINS=http://localhost:5173,https://trip-maker-web.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRES_IN=7d
```

⚠️ **IMPORTANT**: Generate a secure JWT_SECRET for production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚢 Deployment Updates

### Frontend Deployment (Vercel)

1. **Update Environment Variables** in Vercel Dashboard:
   ```
   VITE_API_BASE_URL=https://trip-maker-web-be.vercel.app
   ```

2. **No other changes needed** - the frontend will automatically use the production backend.

### Backend Deployment (Vercel)

1. **Set JWT Secret** in Vercel Dashboard as a Secret:
   ```bash
   vercel secrets add jwt_secret "your-generated-secret-here"
   ```

2. **Environment Variables** in Vercel Dashboard:
   ```
   NODE_ENV=production
   JWT_EXPIRES_IN=7d
   CORS_ORIGINS=https://trip-maker-web.vercel.app
   ```

3. The `vercel.json` file is already configured.

---

## 📖 Using Swagger as Source of Truth

### For Development

1. **Start Backend:**
   ```bash
   cd TripMakerWeb-BE
   npm install
   npm run dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3000/api-docs
   ```

3. **Explore Endpoints:**
   - Click on any endpoint to see details
   - View request/response schemas
   - See all possible error codes
   - Try endpoints with "Try it out" button

### For Type Generation (Optional but Recommended)

You can generate TypeScript types from the Swagger spec:

1. **Install Swagger TypeScript Generator:**
   ```bash
   npm install --save-dev swagger-typescript-api
   ```

2. **Generate Types:**
   ```bash
   npx swagger-typescript-api -p http://localhost:3000/api-docs.json -o ./src/types -n api.ts
   ```

3. **Use Generated Types:**
   ```typescript
   import { User, Profile, AuthResponse } from './types/api';
   ```

### Swagger JSON for API Clients

If you're using API client tools (Postman, Insomnia, etc.), import the Swagger JSON:

```
http://localhost:3000/api-docs.json
```

This will automatically configure all endpoints with correct schemas.

---

## 🆘 Troubleshooting

### Issue: Token Not Being Sent

**Symptom:** Network tab shows no `Authorization` header

**Solution:** 
1. Check if token is stored: `localStorage.getItem('waypoint.token')`
2. Verify `getAuthHeaders()` function is being called
3. Check if token was received from login/register response

### Issue: 401 Unauthorized Error

**Symptom:** Requests fail with 401 status

**Possible Causes:**
1. Token expired (default: 7 days)
2. JWT_SECRET changed on backend
3. Token corrupted in localStorage

**Solution:**
1. Log out and log back in
2. Check token expiration with jwt.io
3. Verify JWT_SECRET hasn't changed

### Issue: CORS Errors

**Symptom:** Browser blocks requests with CORS error

**Solution:**
1. Check backend `CORS_ORIGINS` includes frontend URL
2. Verify backend is running
3. Check browser console for exact CORS error

### Issue: Swagger UI Not Loading

**Symptom:** `/api-docs` shows blank page or error

**Solution:**
1. Check if backend is running
2. Clear browser cache
3. Try accessing `/api-docs.json` directly
4. Check backend console for errors

---

## 📚 Additional Resources

### Documentation

- **Backend README:** `TripMakerWeb-BE/README.md`
- **Backend Integration:** `TripMakerWeb-BE/INTEGRATION.md`
- **Swagger UI:** `http://localhost:3000/api-docs`
- **OpenAPI Spec:** https://swagger.io/specification/

### JWT Resources

- **JWT.io:** https://jwt.io (decode and verify tokens)
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725

### API Testing Tools

- **Swagger UI:** Built into backend at `/api-docs`
- **Postman:** Import OpenAPI spec from `/api-docs.json`
- **Insomnia:** Import OpenAPI spec from `/api-docs.json`
- **curl Examples:** See `INTEGRATION.md`

---

## ✅ Migration Checklist

Use this checklist to track your migration progress:

### Backend Setup
- [ ] Pull latest backend code
- [ ] Run `npm install` to install new dependencies
- [ ] Copy `.env.example` to `.env`
- [ ] Generate secure `JWT_SECRET` and add to `.env`
- [ ] Update `CORS_ORIGINS` in `.env`
- [ ] Start backend with `npm run dev`
- [ ] Verify Swagger UI loads at `http://localhost:3000/api-docs`

### Frontend Code Changes
- [ ] Update `src/services/auth.js`:
  - [ ] Add token storage functions
  - [ ] Update `clearStoredUser()` to clear token
  - [ ] Update `registerUser()` to store token
  - [ ] Update `loginUser()` to store token
  - [ ] Add token expiration handler

- [ ] Update `src/services/profile.js`:
  - [ ] Import `getStoredToken`
  - [ ] Add `getAuthHeaders()` helper
  - [ ] Update `fetchProfile()` to send token
  - [ ] Update `updateProfile()` to send token

### Testing
- [ ] Test registration with new user
- [ ] Test login with existing user
- [ ] Test profile view with token
- [ ] Test profile update with token
- [ ] Test logout clears token
- [ ] Test all endpoints in Swagger UI
- [ ] Test with expired token (wait or manually corrupt)

### Deployment
- [ ] Generate production JWT_SECRET
- [ ] Add JWT_SECRET to Vercel secrets
- [ ] Update Vercel environment variables
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test production deployment
- [ ] Verify Swagger docs accessible in production

---

## 🎉 Summary

After completing this migration:

1. ✅ **JWT Authentication**: Secure token-based authentication
2. ✅ **Swagger Documentation**: Single source of truth for APIs
3. ✅ **Enhanced Security**: Helmet, rate limiting, input validation
4. ✅ **Better Error Handling**: Consistent error responses
5. ✅ **Backward Compatible**: Existing frontend continues to work during migration
6. ✅ **Production Ready**: Proper configuration for deployment

**Next Steps:**
1. Complete the frontend changes outlined in this guide
2. Test thoroughly using the checklist
3. Reference Swagger for any API questions
4. Deploy to production

---

## 📞 Need Help?

If you encounter issues during migration:

1. **Check Swagger First:** `http://localhost:3000/api-docs`
2. **Review Backend Logs:** Check terminal where `npm run dev` is running
3. **Check Browser Console:** Look for errors in DevTools
4. **Test with Swagger UI:** Verify backend works independently
5. **Compare with Examples:** See code examples in this guide

---

**Version:** 2.0.0  
**Last Updated:** January 30, 2026  
**Backend Repository:** https://github.com/avinash6982/TripMakerWeb-BE  
**Frontend Repository:** https://github.com/avinash6982/TripMakerWeb
