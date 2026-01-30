# API Docs Not Showing - Quick Fix

## Problem
The `/api-docs` endpoint isn't accessible after deployment.

## Likely Cause
JWT_SECRET is not configured in Vercel, causing the server to exit on startup.

## Solution

### Option 1: Set JWT_SECRET in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Select your project:** `TripMakerWeb-BE`

3. **Go to Settings → Environment Variables**

4. **Add JWT_SECRET:**
   - Name: `JWT_SECRET`
   - Value: (generate a new one - see below)
   - Environment: `Production`

5. **Generate a secure secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste as the value

6. **Redeploy:**
   - Go to Deployments
   - Click the three dots on latest deployment
   - Click "Redeploy"

### Option 2: Use Vercel CLI

```bash
# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to Vercel (copy the generated value)
vercel env add JWT_SECRET production

# Paste the generated secret when prompted

# Redeploy
vercel --prod
```

### Option 3: Temporarily Allow Auto-Generation in Production (Quick Test)

If you want to test quickly, I can update the server to allow auto-generation in production temporarily. **Not recommended for real production!**

---

## Verify It's Working

After redeployment, check:

1. **Server Root:**
   ```
   https://trip-maker-web-be.vercel.app
   ```
   Should return: `{"message":"TripMaker Authentication API","version":"2.0.0","documentation":"..."}`

2. **Health Check:**
   ```
   https://trip-maker-web-be.vercel.app/health
   ```
   Should return: `{"status":"ok","timestamp":"...","uptime":...}`

3. **API Docs:**
   ```
   https://trip-maker-web-be.vercel.app/api-docs
   ```
   Should show the Swagger UI

---

## Check Deployment Logs

If it still doesn't work, check the logs:

### Via Vercel Dashboard:
1. Go to your project
2. Click on latest deployment
3. Click "Functions" or "Logs"
4. Look for errors

### Via Vercel CLI:
```bash
vercel logs
```

Look for:
- ❌ `CRITICAL: JWT_SECRET is required in production!`
- ❌ Module not found errors
- ❌ Port binding errors

---

## Common Issues

### Issue 1: JWT_SECRET not set
**Error in logs:** "CRITICAL: JWT_SECRET is required in production!"
**Fix:** Set JWT_SECRET in Vercel environment variables (Option 1 or 2 above)

### Issue 2: Wrong environment variable format in vercel.json
**Problem:** `@jwt_secret` reference doesn't work
**Fix:** Remove the `env` section from vercel.json and set variables in Vercel dashboard instead

### Issue 3: Build failed
**Fix:** Check Vercel build logs for missing dependencies

---

## Quick Checklist

- [ ] JWT_SECRET added to Vercel environment variables
- [ ] Value is a secure random string (min 32 chars)
- [ ] Environment is set to "Production"
- [ ] Redeployed after adding variable
- [ ] Check `/health` endpoint works
- [ ] Check `/api-docs` endpoint shows Swagger UI
