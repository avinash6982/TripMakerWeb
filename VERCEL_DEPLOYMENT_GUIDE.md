# 🚀 Vercel Deployment Guide (Updated)

## Important: vercel.json Handles Most Configuration

Since we have a `vercel.json` file in the repository, **Vercel will automatically configure the build settings**. You don't need to manually set most build options!

---

## Step-by-Step Deployment

### Step 1: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose **GitHub** and find `avinash6982/TripMakerWeb`
5. Click **"Import"**

### Step 2: Project Settings (Just Accept Defaults!)

When importing, you'll see a screen with these options:

**✨ IMPORTANT: Just accept all the defaults and click "Deploy"!** 

Vercel will automatically read `vercel.json` and configure everything correctly.

#### What You'll See During Import:

**Configure Project Screen:**
- **Framework Preset**: Will likely auto-detect as "Other" or "Vite" - **Leave as is** ✅
- **Root Directory**: Should show "/" or be empty - **Leave as is** ✅
- **Build Command**: Might show "npm run build" - **Leave as is** ✅
- **Output Directory**: Should be empty or show "dist" - **Leave as is** ✅
- **Install Command**: Should show "npm install" - **Leave as is** ✅

**You don't need to change ANY of these!** The `vercel.json` file in your repository tells Vercel exactly what to do.

#### ⚠️ Common Confusion About Root Directory

**Don't worry if you can't type "./" in the Root Directory field!**

The Root Directory field in modern Vercel:
- Often shows a dropdown of folders (not a text input)
- Leaving it empty or at "/" means the repository root
- This is exactly what we want!
- Our `vercel.json` handles the actual path configuration

**Just leave it as the default (empty or /)** - this is correct!

### Step 3: Set Environment Variables (REQUIRED!)

This is the **only critical step** you must do manually.

1. **During import**, look for **"Environment Variables"** section
2. **Or after import**: Go to **Settings** → **"Environment Variables"** (in left sidebar)

#### Required Variables:

Click **"Add"** for each variable:

**1. JWT_SECRET**
```
Name: JWT_SECRET
Value: [Generate using command below]
Environment: Production
```

Generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**2. NODE_ENV**
```
Name: NODE_ENV
Value: production
Environment: Production
```

**3. VITE_API_URL**
```
Name: VITE_API_URL
Value: /api
Environment: Production
```

**4. CORS_ORIGINS** (Update after first deployment!)
```
Name: CORS_ORIGINS
Value: * (temporarily, update after you get your URL)
Environment: Production
```

After first deployment, update `CORS_ORIGINS` to your actual Vercel URL:
```
Value: https://your-app.vercel.app
```

### Step 4: Deploy!

1. Click **"Deploy"** button
2. Wait for build to complete (usually 1-3 minutes)
3. Once deployed, you'll get a URL like: `https://trip-maker-web-xxx.vercel.app`

### Step 5: Update CORS After First Deploy

1. Copy your deployment URL
2. Go to **Settings** → **"Environment Variables"**
3. Find **CORS_ORIGINS** and click **"Edit"**
4. Change from `*` to your actual URL: `https://your-app.vercel.app`
5. Click **"Save"**
6. Redeploy: **Deployments** tab → Three dots → **"Redeploy"**

---

## Verification Checklist

After deployment, test these URLs (replace with your actual URL):

### ✅ Frontend
```bash
curl https://your-app.vercel.app
```
**Expected**: HTML page loads

### ✅ Backend Health
```bash
curl https://your-app.vercel.app/api/health
```
**Expected**: 
```json
{"status":"ok","timestamp":"...","uptime":...}
```

### ✅ API Root
```bash
curl https://your-app.vercel.app/api
```
**Expected**:
```json
{"message":"TripMaker Authentication API","version":"2.0.0",...}
```

### ✅ API Documentation
Open in browser: `https://your-app.vercel.app/api-docs`
**Expected**: Swagger UI interface

### ✅ Test Registration
```bash
curl -X POST https://your-app.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```
**Expected**: User created with token

---

## Common Issues & Solutions

### Issue: Build Fails

**Check:**
1. Go to **Deployments** → Click failed deployment → **"Building"** tab
2. Look for error messages

**Common Causes:**
- Missing environment variables
- Build command fails
- Dependencies not installing

**Solution:**
- Ensure all environment variables are set
- Check build logs for specific errors
- Verify `package.json` scripts are correct

### Issue: API Routes Return 404

**Cause**: Routes not configured correctly

**Solution**: 
- Verify `vercel.json` is in repository root
- Check that routes section has `/api/*` mapping
- Redeploy after any changes

### Issue: Frontend Works but API Doesn't

**Check:**
1. Go to **Deployments** → **"Functions"** tab
2. Look for backend function logs

**Common Causes:**
- Environment variables not set
- Backend build failed
- CORS issues

**Solution:**
- Set all required environment variables
- Check backend builds successfully
- Update CORS_ORIGINS to your domain

### Issue: CORS Errors in Browser

**Symptoms**: 
- Frontend loads but can't reach API
- Console shows CORS errors

**Solution**:
1. Update `CORS_ORIGINS` to your Vercel URL
2. Make sure `VITE_API_URL=/api` is set
3. Redeploy after changes

---

## What vercel.json Does For You

Our `vercel.json` configuration automatically:

1. ✅ **Builds frontend** as static site using Vite
2. ✅ **Builds backend** as serverless functions
3. ✅ **Routes `/api/*`** to backend
4. ✅ **Routes everything else** to frontend
5. ✅ **Sets output directory** for frontend build
6. ✅ **Configures build process** for both apps

You don't need to manually configure these in Vercel UI!

---

## Alternative: Deploy via CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Set environment variables
vercel env add JWT_SECRET production
vercel env add NODE_ENV production
vercel env add VITE_API_URL production
vercel env add CORS_ORIGINS production

# Deploy to production
vercel --prod
```

---

## Continuous Deployment

After initial setup, automatic deployments happen on:

- **Push to `main`** → Production deployment
- **Pull requests** → Preview deployments
- **Other branches** → Preview deployments

No additional configuration needed!

---

## Environment Variables Summary

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `JWT_SECRET` | Random 64-char string | Yes | Generate securely |
| `NODE_ENV` | `production` | Yes | Backend environment |
| `VITE_API_URL` | `/api` | Yes | Frontend API path |
| `CORS_ORIGINS` | Your Vercel URL | Yes | Update after deploy |
| `PORT` | `3000` | No | Auto-set by Vercel |

---

## Success Criteria

Your deployment is successful when:

- [x] Build completes without errors
- [x] Frontend loads at your Vercel URL
- [x] `/api/health` returns status
- [x] `/api-docs` shows Swagger UI
- [x] Registration API works
- [x] No CORS errors in console
- [x] Frontend can communicate with backend

---

## Getting Help

- **Build Issues**: Check deployment logs in Vercel dashboard
- **API Issues**: Check Functions logs
- **CORS Issues**: Verify CORS_ORIGINS matches your domain
- **General**: See Vercel documentation at https://vercel.com/docs

---

## Quick Reference

### Vercel Dashboard Locations

| Setting | Location |
|---------|----------|
| Environment Variables | Settings → Environment Variables |
| Build Settings | Settings → General → Build & Development Settings |
| Deployment Logs | Deployments → [Click deployment] → Building |
| Function Logs | Deployments → [Click deployment] → Functions |
| Domain Settings | Settings → Domains |
| Project Settings | Settings → General |

### Important URLs After Deploy

- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`
- **Health Check**: `https://your-app.vercel.app/api/health`
- **API Docs**: `https://your-app.vercel.app/api-docs`
- **Vercel Dashboard**: `https://vercel.com/[your-username]/[project-name]`

---

**Last Updated**: January 30, 2026

**Key Takeaway**: With `vercel.json` in place, you only need to set environment variables. Everything else is automatic! 🚀
