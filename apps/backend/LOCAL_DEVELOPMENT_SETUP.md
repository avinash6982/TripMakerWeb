# Local Development Setup - Fix CORS Errors

**Issue:** Local frontend at `localhost:5173` cannot connect to production backend due to CORS.

---

## ✅ Solution: Two Options

### Option 1: Run Backend Locally (Recommended)

This is the best approach for development as it's faster and you can see logs in real-time.

#### Step 1: Start Backend Locally

```bash
cd /Users/avinash1/Documents/projects/cursor_agent/TripMakerWeb-BE
npm run dev
```

You should see:
```
🚀 Auth server listening on port 3000
📚 API Documentation: http://localhost:3000/api-docs
🏥 Health check: http://localhost:3000/health
```

**Backend is now running at:** `http://localhost:3000`

#### Step 2: Update Frontend to Use Local Backend

In your **frontend** project:

**File:** `.env.local` or `.env.development`

```bash
VITE_API_BASE_URL=http://localhost:3000
```

If the file doesn't exist, create it in the frontend root directory.

#### Step 3: Restart Frontend

```bash
# In frontend directory
npm run dev
```

#### Step 4: Test

1. Open browser: `http://localhost:5173/register`
2. Fill in registration form
3. Check browser console - **NO CORS ERRORS!**
4. Check backend terminal - you'll see the API requests coming in

---

### Option 2: Add Localhost to Production CORS

If you want to keep using the production backend from local frontend:

#### Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project: `TripMakerWeb-BE`
3. Go to: **Settings** → **Environment Variables**
4. Find: `CORS_ORIGINS`
5. Update to include localhost:
   ```
   http://localhost:5173,https://trip-maker-web.vercel.app
   ```
6. Click **Save**
7. **Redeploy** the backend (or push a commit)

**Note:** This is less secure as production will accept requests from localhost. Only use during development.

---

## 🔍 Verify CORS Configuration

### Check Backend CORS Settings

Your backend `.env` file should have:
```bash
CORS_ORIGINS=http://localhost:5173,https://trip-maker-web.vercel.app
```

✅ **Already configured correctly in your local `.env`!**

### Check Frontend API URL

Your frontend should have environment variables:

**For local development (`.env.local`):**
```bash
VITE_API_BASE_URL=http://localhost:3000
```

**For production (`.env.production`):**
```bash
VITE_API_BASE_URL=https://trip-maker-web-be.vercel.app
```

---

## 🐛 Troubleshooting

### Issue: Still seeing CORS errors

**Check 1: Is frontend pointing to correct backend?**
```javascript
// In browser console on frontend page:
console.log(import.meta.env.VITE_API_BASE_URL)
```

Should show: `http://localhost:3000` for local dev

**Check 2: Is backend actually running?**
```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

**Check 3: Check backend CORS origins**

Look at the terminal where backend is running. When you make a request, you should see:
```
GET /health 200 15.234 ms - 89
POST /register 201 1234.567 ms - 234
```

If you see `OPTIONS /register 204` before the POST, that's the CORS preflight check - it's working!

**Check 4: Clear browser cache**

Hard refresh: `Cmd/Ctrl + Shift + R`

---

## 📋 Complete Local Development Flow

### 1. Backend Setup (This Repo)

```bash
# Terminal 1 - Backend
cd /Users/avinash1/Documents/projects/cursor_agent/TripMakerWeb-BE
npm install
npm run dev
```

Backend running at: `http://localhost:3000`

### 2. Frontend Setup (Other Repo)

```bash
# Terminal 2 - Frontend
cd /Users/avinash1/Documents/projects/cursor_agent/TripMakerWeb

# Create .env.local file
echo "VITE_API_BASE_URL=http://localhost:3000" > .env.local

# Install and run
npm install
npm run dev
```

Frontend running at: `http://localhost:5173`

### 3. Test Registration

1. Open: `http://localhost:5173/register`
2. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm: `password123`
3. Click **Create account**

**Check backend terminal:**
```
POST /register 201 1432.456 ms - 234
```

**Check browser console:**
- No CORS errors ✅
- Response with token ✅

**Check browser DevTools > Application > Local Storage:**
- `waypoint.token`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ✅
- `waypoint.user`: `{"id":"...","email":"test@example.com"}` ✅

---

## 🎯 Current Error Analysis

Looking at your screenshot:

### Error Messages
```
Access to fetch at 'https://trip-maker-web-be.vercel.app/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

```
Access to fetch at 'https://trip-maker-web-be.vercel.app/register1' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### Root Cause
- Frontend: `http://localhost:5173` (local)
- Backend: `https://trip-maker-web-be.vercel.app` (production)
- Production CORS: Only allows `https://trip-maker-web.vercel.app`
- Result: ❌ Blocked

### Additional Issue Noticed
The URL shows `register1` in one of the errors:
```
https://trip-maker-web-be.vercel.app/register1
```

This is incorrect! The endpoint should be:
```
https://trip-maker-web-be.vercel.app/register
```

**Check your frontend code** - the API URL might have a typo.

---

## 🔧 Quick Fix Commands

### Start Backend Locally

```bash
cd /Users/avinash1/Documents/projects/cursor_agent/TripMakerWeb-BE
npm run dev
```

### Update Frontend .env

```bash
cd /Users/avinash1/Documents/projects/cursor_agent/TripMakerWeb

# Create or update .env.local
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:3000
EOF

# Restart frontend
npm run dev
```

### Test Connection

```bash
# Test backend health
curl http://localhost:3000/health

# Test registration
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📚 Environment Variable Reference

### Backend (.env)

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database/Storage
USER_DB_PATH=data/users.json

# CORS Configuration (for local backend)
CORS_ORIGINS=http://localhost:5173,https://trip-maker-web.vercel.app

# JWT Authentication (optional for dev)
# JWT_SECRET will auto-generate if not set
JWT_EXPIRES_IN=7d
```

### Frontend (.env.local)

```bash
# API Configuration for LOCAL development
VITE_API_BASE_URL=http://localhost:3000
```

### Frontend (.env.production)

```bash
# API Configuration for PRODUCTION deployment
VITE_API_BASE_URL=https://trip-maker-web-be.vercel.app
```

---

## ✅ Success Indicators

You'll know it's working when:

### Backend Terminal Shows:
```
🚀 Auth server listening on port 3000
📚 API Documentation: http://localhost:3000/api-docs
🏥 Health check: http://localhost:3000/health
⚠️  Development mode: Using auto-generated JWT secret
```

And when you make requests:
```
POST /register 201 1234.567 ms - 234
POST /login 200 567.890 ms - 189
GET /profile/abc-123 200 45.678 ms - 256
```

### Frontend Browser Console Shows:
- ✅ No CORS errors
- ✅ API responses with status 200/201
- ✅ JWT tokens in responses
- ✅ localStorage populated with token

### Browser DevTools > Network Tab Shows:
- ✅ Request URL: `http://localhost:3000/register`
- ✅ Status: 201 Created
- ✅ Response Headers: `access-control-allow-origin: http://localhost:5173`
- ✅ Response Body: `{"id":"...","email":"...","token":"..."}`

---

## 🎓 Why This Happens

### CORS (Cross-Origin Resource Sharing)

CORS is a security feature that prevents websites from making requests to different domains without permission.

**Same Origin:** ✅ Allowed
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5173`

**Different Origin:** ❌ Blocked (unless explicitly allowed)
- Frontend: `http://localhost:5173`
- Backend: `https://trip-maker-web-be.vercel.app`

**Your Situation:**
- Local Frontend: `http://localhost:5173`
- Production Backend: `https://trip-maker-web-be.vercel.app`
- Backend CORS: Only allows `https://trip-maker-web.vercel.app`
- Result: ❌ Blocked

**Solution 1 (Recommended):**
- Run backend locally: `http://localhost:3000`
- Frontend connects to: `http://localhost:3000`
- Same `localhost`, different ports: ✅ Allowed with CORS config

**Solution 2:**
- Add `http://localhost:5173` to production CORS
- Less secure, but works for development

---

## 🚀 Next Steps

1. **Start backend locally:** `npm run dev`
2. **Update frontend .env.local:** `VITE_API_BASE_URL=http://localhost:3000`
3. **Restart frontend:** `npm run dev`
4. **Test registration flow**
5. **Verify JWT integration** (check localStorage for token)
6. **Follow FRONTEND_MIGRATION_GUIDE.md** if tokens not being stored

---

**Last Updated:** January 30, 2026  
**Issue:** CORS error when local frontend connects to production backend  
**Solution:** Run backend locally and update frontend API URL
