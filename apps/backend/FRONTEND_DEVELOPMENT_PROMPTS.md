# Frontend Development Prompts & Change Guide

This document provides ready-to-use prompts for making changes to the **TripMakerWeb** frontend using Cursor Agent.

**Frontend URL:** https://trip-maker-web.vercel.app  
**Backend URL:** https://trip-maker-web-be.vercel.app  
**API Docs:** https://trip-maker-web-be.vercel.app/api-docs

---

## 📋 Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Authentication Integration Prompts](#authentication-integration-prompts)
3. [UI/UX Enhancement Prompts](#uiux-enhancement-prompts)
4. [Feature Addition Prompts](#feature-addition-prompts)
5. [Bug Fix Prompts](#bug-fix-prompts)
6. [Testing Prompts](#testing-prompts)
7. [Deployment Prompts](#deployment-prompts)

---

## 🎯 How to Use This Guide

### For Each Prompt:
1. **Copy the prompt** from the section you need
2. **Customize** the placeholders (in `<brackets>`)
3. **Paste** into Cursor Agent
4. **Review** the changes made by the agent
5. **Test** locally before deploying

### Best Practices:
- Always reference the backend Swagger docs: https://trip-maker-web-be.vercel.app/api-docs
- Test changes locally first: `npm run dev`
- Use the FRONTEND_MIGRATION_GUIDE.md for JWT integration details
- Check browser console for errors after changes

---

## 🔐 Authentication Integration Prompts

### Integrate JWT Authentication

```
I need to integrate JWT authentication with the backend at https://trip-maker-web-be.vercel.app

Follow the complete instructions in FRONTEND_MIGRATION_GUIDE.md to:
1. Add token storage functions to src/services/auth.js
2. Update registerUser() to store JWT tokens
3. Update loginUser() to store JWT tokens
4. Update clearStoredUser() to clear tokens
5. Update src/services/profile.js to send Authorization headers
6. Add token expiration handling (redirect to login on 401 errors)

Reference the backend Swagger docs for API contracts: https://trip-maker-web-be.vercel.app/api-docs

Test the integration after implementation.
```

### Fix Token Storage

```
The JWT token from login/registration responses isn't being stored correctly.

Update src/services/auth.js to:
1. Check if the response contains a 'token' field
2. Store it in localStorage as 'waypoint.token'
3. Ensure it's cleared on logout

The backend returns:
{
  "id": "uuid",
  "email": "user@example.com",
  "token": "jwt-token-here"
}

Verify the token is stored by checking localStorage.getItem('waypoint.token') in browser console.
```

### Add Authorization Headers

```
Profile API calls need to send JWT tokens in Authorization headers.

Update src/services/profile.js:
1. Import getStoredToken from './auth.js'
2. Create a getAuthHeaders() helper function that returns headers with Bearer token
3. Update fetchProfile() to use getAuthHeaders()
4. Update updateProfile() to use getAuthHeaders()

Header format should be:
Authorization: Bearer <token>

Test by checking Network tab in DevTools - verify Authorization header is present.
```

### Handle Token Expiration

```
Add automatic handling for expired JWT tokens.

In src/services/auth.js:
1. Create a handleTokenExpiration() function that:
   - Clears all auth data (user, token, profile)
   - Shows a brief message "Session expired, please log in again"
   - Redirects to /login

2. Update requestJson() function to check for 401 status
3. If 401 and not on /login or /register routes, call handleTokenExpiration()

Test by manually corrupting the token in localStorage and trying to access profile.
```

---

## 🎨 UI/UX Enhancement Prompts

### Add Loading States

```
Add loading indicators for all API calls.

For each page that makes API calls (Login, Register, Profile):
1. Add a loading state: const [loading, setLoading] = useState(false)
2. Set loading=true before API call
3. Set loading=false after API call (success or error)
4. Disable form submit buttons while loading
5. Show "Loading..." text or spinner

Use consistent styling across all pages.
```

### Improve Error Messages

```
Make error messages more user-friendly and visible.

Update all pages (Login, Register, Profile) to:
1. Display errors in a prominent colored box (red background, white text)
2. Show for at least 5 seconds
3. Include an icon (❌) before error text
4. Make errors dismissible with an X button
5. Position at top of form
6. Add smooth fade-in/fade-out animation

Keep success messages with green background.
```

### Add Form Validation

```
Add client-side form validation before submitting.

For Registration page:
1. Validate email format before submit
2. Check password minimum length (6 characters)
3. Verify passwords match
4. Show inline validation errors (red text under fields)
5. Disable submit button if validation fails
6. Show validation errors immediately on blur

For Login page:
1. Validate email format
2. Check password is not empty
3. Same styling as registration

For Profile page:
1. Validate email format
2. Validate phone number format (optional, but if provided, must be valid)
3. Show validation errors inline
```

### Make UI Responsive

```
Ensure the app works well on mobile devices.

Updates needed:
1. Make all forms responsive (stack vertically on mobile)
2. Adjust font sizes for mobile (larger for readability)
3. Make buttons full-width on mobile
4. Ensure nav bar collapses on mobile
5. Test on viewport sizes: 375px, 768px, 1024px, 1440px
6. Add media queries in CSS

Test by opening DevTools and using responsive mode.
```

---

## ✨ Feature Addition Prompts

### Add Password Visibility Toggle

```
Add a show/hide password toggle button.

For Login and Register pages:
1. Add an eye icon button next to password fields
2. Toggle between type="password" and type="text"
3. Change icon between eye and eye-slash when toggled
4. Style the button to look integrated with the input field
5. Add accessible aria-labels

Use a simple SVG icon or emoji (👁️ / 👁️‍🗨️).
```

### Add Remember Me Checkbox

```
Add a "Remember Me" checkbox on the login page.

Implementation:
1. Add checkbox input below password field
2. If checked, store a flag in localStorage: 'waypoint.rememberMe'
3. On page load, if flag exists and user exists, auto-fill email
4. Don't auto-fill password (security best practice)
5. Style consistently with rest of form
```

### Add Profile Picture Upload

```
Add profile picture upload functionality.

Note: Backend doesn't support this yet, so:
1. Add UI for profile picture upload in Profile page
2. Show preview of selected image
3. Store in localStorage as base64 (temporary solution)
4. Display in profile and header
5. Add "Remove Picture" button
6. Show placeholder image if no picture

Later, this can be connected to a backend endpoint when added.
```

### Add Password Strength Indicator

```
Add a password strength indicator on registration.

On Register page:
1. Show strength bar below password field (red/yellow/green)
2. Calculate strength based on:
   - Length (6+ chars = weak, 8+ = medium, 12+ = strong)
   - Contains numbers
   - Contains special characters
   - Contains uppercase and lowercase
3. Show text: "Weak", "Medium", "Strong"
4. Update in real-time as user types
5. Style with colors: red (weak), yellow (medium), green (strong)
```

---

## 🐛 Bug Fix Prompts

### Fix CORS Issues

```
If seeing CORS errors in console:

1. Verify the backend URL in .env file is correct:
   VITE_API_BASE_URL=https://trip-maker-web-be.vercel.app

2. Check that requests are being made to the correct URL (no trailing slashes)

3. Verify Authorization headers are being sent correctly

4. Check Network tab in DevTools for the actual request being made

5. Compare with working curl command:
   curl -H "Origin: https://trip-maker-web.vercel.app" \
     https://trip-maker-web-be.vercel.app/health -v

Report the exact error message if issue persists.
```

### Fix Profile Not Loading After Login

```
If profile doesn't load after successful login:

Debug and fix:
1. Check if profile fetch is being called in Login.jsx after successful login
2. Verify the userId is correct in the fetch call
3. Check if profile data is being saved to localStorage
4. Add console.log statements to track data flow:
   - After login API response
   - Before profile fetch
   - After profile fetch
   - When saving to localStorage
5. Check Network tab for the /profile/:id request

Fix any issues found in the data flow.
```

### Fix Language Not Persisting

```
If language changes aren't persisting across sessions:

Fix src/pages/Profile.jsx and src/i18n.js:
1. Ensure language is saved to localStorage as 'waypoint.language' when changed
2. Check that i18n.changeLanguage() is being called
3. Verify profile update API call includes language field
4. Ensure i18n.js loads language from localStorage on init
5. Add console.log to track language changes

Test by:
1. Change language in profile
2. Refresh page
3. Language should persist
```

### Fix Token Not Being Sent

```
If API requests aren't including Authorization header:

Debug in src/services/profile.js:
1. Check if getStoredToken() is returning a value
2. Verify getAuthHeaders() is constructing header correctly
3. Ensure fetchProfile() and updateProfile() are using getAuthHeaders()
4. Check browser DevTools Network tab:
   - Look for Authorization header in request
   - It should be: "Bearer <token>"

Add console.log to debug:
```javascript
const token = getStoredToken();
console.log('Token from storage:', token);
const headers = getAuthHeaders();
console.log('Headers being sent:', headers);
```

Fix any issues in the auth header construction.
```

---

## 🧪 Testing Prompts

### Test Complete Authentication Flow

```
Create a test checklist and manually test the complete flow:

1. Registration:
   - [ ] Can register with valid email/password
   - [ ] Token is received and stored
   - [ ] Redirected to /home
   - [ ] User data in localStorage

2. Login:
   - [ ] Can login with registered credentials
   - [ ] Token is received and stored
   - [ ] Profile is fetched and stored
   - [ ] Language is applied
   - [ ] Redirected to /home

3. Profile:
   - [ ] Profile page loads user data
   - [ ] Can update all fields
   - [ ] Changes are saved
   - [ ] Language change takes effect immediately
   - [ ] Data persists across refresh

4. Logout:
   - [ ] All data cleared from localStorage
   - [ ] Redirected to /login
   - [ ] Cannot access protected routes

5. Token Expiration:
   - [ ] Handled gracefully (redirect to login)
   - [ ] Clear error message shown

Document any issues found.
```

### Test API Integration

```
Test all API endpoints using the frontend:

For each endpoint, verify:
1. Registration (POST /register):
   - [ ] Sends correct payload
   - [ ] Receives token in response
   - [ ] Handles 409 (duplicate email) correctly
   - [ ] Handles 400 (validation) correctly

2. Login (POST /login):
   - [ ] Sends correct credentials
   - [ ] Receives token in response
   - [ ] Handles 401 (wrong password) correctly
   - [ ] Handles 400 (missing fields) correctly

3. Get Profile (GET /profile/:id):
   - [ ] Sends Authorization header
   - [ ] Receives complete profile
   - [ ] Handles 404 (user not found)

4. Update Profile (PUT /profile/:id):
   - [ ] Sends Authorization header
   - [ ] Sends all required fields
   - [ ] Receives updated profile
   - [ ] Handles validation errors

Check Network tab in DevTools for each request.
```

### Test Error Handling

```
Test error handling for all scenarios:

Test these error cases:
1. Network error (disconnect wifi):
   - [ ] Shows user-friendly error message
   - [ ] Doesn't break the app
   - [ ] User can retry

2. Invalid credentials:
   - [ ] Shows correct error message
   - [ ] Doesn't clear form
   - [ ] User can correct and retry

3. Expired token:
   - [ ] Redirects to login
   - [ ] Shows session expired message
   - [ ] Clears all auth data

4. Server error (500):
   - [ ] Shows generic error message
   - [ ] Doesn't expose technical details
   - [ ] User can navigate away

5. Rate limiting (429):
   - [ ] Shows rate limit message
   - [ ] Tells user to wait
   - [ ] Form stays filled

Document any missing error handling.
```

---

## 🚀 Deployment Prompts

### Prepare for Production Deployment

```
Ensure the frontend is production-ready:

1. Environment Variables:
   - Create .env.production file
   - Set VITE_API_BASE_URL=https://trip-maker-web-be.vercel.app
   - Verify no development URLs in code

2. Code Quality:
   - Remove all console.log statements (or use console.debug)
   - Remove commented-out code
   - Check for TODO comments and address them

3. Build Test:
   - Run: npm run build
   - Fix any build warnings or errors
   - Test the build: npm run preview

4. Performance:
   - Check bundle size
   - Lazy load routes if needed
   - Optimize images if any

5. SEO:
   - Add proper meta tags
   - Add page titles
   - Add og:image for social sharing

Create a checklist of what was done.
```

### Update Environment Variables

```
Update environment variables for different environments:

Create three .env files:
1. .env.local (for local development):
   VITE_API_BASE_URL=http://localhost:3000

2. .env.development (for dev deployment):
   VITE_API_BASE_URL=https://trip-maker-web-be.vercel.app

3. .env.production (for production):
   VITE_API_BASE_URL=https://trip-maker-web-be.vercel.app

Update .gitignore to include .env.local but not others.
Update README.md with environment setup instructions.
```

### Deploy to Vercel

```
Set up automated deployment to Vercel:

1. Verify vercel.json is configured (if not, create it):
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_BASE_URL": "https://trip-maker-web-be.vercel.app"
  }
}

2. Set environment variables in Vercel dashboard:
   - Go to project settings
   - Add VITE_API_BASE_URL
   - Set for Production environment

3. Connect GitHub repo to Vercel (if not already):
   - Import project in Vercel dashboard
   - Select repository
   - Configure build settings
   - Deploy

4. Test deployment:
   - Visit https://trip-maker-web.vercel.app
   - Test complete auth flow
   - Check for console errors
   - Verify API calls work

Document deployment URL and any issues.
```

---

## 📝 Documentation Update Prompts

### Update README

```
Update the frontend README.md to reflect current state:

Include:
1. Project description
2. Current features (with JWT integration)
3. Setup instructions
4. Environment variables needed
5. npm scripts explanation
6. Deployment information
7. Link to backend API docs
8. Link to FRONTEND_MIGRATION_GUIDE.md

Keep it concise but complete.
```

### Create Integration Status Doc

```
Create a new file: INTEGRATION_STATUS.md

Document:
1. ✅ Completed integrations:
   - JWT token storage
   - Authorization headers
   - Token expiration handling
   - Profile management
   - etc.

2. 🚧 In Progress:
   - (list any ongoing work)

3. 📋 Pending:
   - (list what's not yet done from FRONTEND_MIGRATION_GUIDE.md)

4. 🐛 Known Issues:
   - (list any bugs or limitations)

5. 🔗 Resources:
   - Backend Swagger: https://trip-maker-web-be.vercel.app/api-docs
   - Migration Guide: link to file
   - Integration Guide: link to backend file

Keep it updated as you work.
```

---

## 💡 Pro Tips

### When Asking Cursor Agent for Changes:

1. **Be Specific:**
   ```
   ✅ GOOD: "Add a loading spinner to the Login button that shows while the API request is in progress"
   ❌ BAD: "Make the login better"
   ```

2. **Reference Files:**
   ```
   ✅ GOOD: "In src/services/auth.js, update the loginUser function to..."
   ❌ BAD: "Update the login code"
   ```

3. **Include Context:**
   ```
   ✅ GOOD: "The backend now returns a 'token' field in the response. Update registerUser() to store it..."
   ❌ BAD: "Fix the token"
   ```

4. **Request Testing:**
   ```
   ✅ GOOD: "After making changes, test by: 1) registering a new user, 2) checking localStorage, 3) verifying the token is present"
   ❌ BAD: "Make sure it works"
   ```

5. **Reference Documentation:**
   ```
   ✅ GOOD: "Follow the instructions in FRONTEND_MIGRATION_GUIDE.md section 'Change 1: Update Auth Service to Handle JWT Tokens'"
   ❌ BAD: "Add JWT stuff"
   ```

### Debugging Steps:

Always include these in prompts when fixing bugs:

```
Debug this issue by:
1. Adding console.log statements to track data flow
2. Checking browser DevTools Console for errors
3. Checking Network tab for API requests/responses
4. Verifying localStorage content
5. Testing with backend Swagger UI to confirm backend works
6. Comparing with expected behavior in documentation

Report findings before suggesting fixes.
```

---

## 🔗 Quick Links

- **Backend Swagger:** https://trip-maker-web-be.vercel.app/api-docs
- **Backend API Docs JSON:** https://trip-maker-web-be.vercel.app/api-docs.json
- **Frontend:** https://trip-maker-web.vercel.app
- **Backend Health:** https://trip-maker-web-be.vercel.app/health
- **Frontend Migration Guide:** [FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md)
- **API Quick Reference:** [Backend INTEGRATION.md](./INTEGRATION.md)

---

## ✅ Checklist: Complete Integration

Use this to track JWT integration progress:

### Backend Configuration
- [x] JWT_SECRET set in Vercel
- [x] CORS allows frontend origin
- [x] Swagger documentation accessible
- [x] All endpoints working

### Frontend Implementation
- [ ] Token storage functions added
- [ ] registerUser() stores token
- [ ] loginUser() stores token
- [ ] clearStoredUser() clears token
- [ ] getAuthHeaders() helper created
- [ ] fetchProfile() sends token
- [ ] updateProfile() sends token
- [ ] Token expiration handled
- [ ] All flows tested

### Testing
- [ ] Registration flow works end-to-end
- [ ] Login flow works end-to-end
- [ ] Profile fetch works with token
- [ ] Profile update works with token
- [ ] Logout clears everything
- [ ] Token expiration redirects to login
- [ ] Error messages are user-friendly
- [ ] No console errors in production

### Deployment
- [ ] Environment variables set
- [ ] Production build works
- [ ] Deployed to Vercel
- [ ] Production testing complete

---

**Last Updated:** January 30, 2026  
**For:** TripMakerWeb Frontend Development  
**Backend Version:** 2.0.0
