# 📋 Vercel Deployment Checklist

Use this checklist to ensure your Vercel deployment is configured correctly.

## Pre-Deployment Checklist

### ✅ Code Repository
- [x] Git repository initialized
- [x] Connected to GitHub: `https://github.com/avinash6982/TripMakerWeb`
- [x] Pushed to `main` branch
- [x] Monorepo structure in place

### ✅ Project Configuration
- [x] `vercel.json` configured for monorepo
- [x] `package.json` with workspaces
- [x] Frontend and backend in `apps/` directory
- [x] Dependencies installed and working

### ✅ Environment Variables Prepared
- [ ] JWT_SECRET generated (see below)
- [ ] CORS_ORIGINS list ready
- [ ] All required vars documented

## Vercel Configuration Steps

### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Log in to your account
3. Find or import the "TripMakerWeb" project

### Step 2: Configure Build Settings

Go to **Settings → General → Build & Development Settings**

```
Framework Preset: Other
Root Directory: ./
Build Command: npm run build
Output Directory: (leave empty)
Install Command: npm install
```

### Step 3: Set Environment Variables

Go to **Settings → Environment Variables**

#### Required Production Variables

| Variable | Value | Environment | Notes |
|----------|-------|-------------|-------|
| `NODE_ENV` | `production` | Production | Backend environment |
| `JWT_SECRET` | `<your-secret>` | Production | Generate securely (see below) |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Production | Your Vercel domain |
| `VITE_API_URL` | `/api` | Production | Frontend API endpoint |
| `PORT` | `3000` | All | Backend port (optional) |

#### How to Generate JWT_SECRET

**Option 1 - Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2 - Using OpenSSL:**
```bash
openssl rand -hex 32
```

**Option 3 - Online Generator:**
Use a secure password generator to create a 64-character string.

**Important**: 
- Keep this secret secure
- Never commit it to Git
- Use a different secret for production vs development

#### Setting CORS_ORIGINS

After first deployment, you'll get a Vercel URL. Update this variable:

1. First deployment: Use `*` (wildcard) temporarily
2. After deployment: Copy your Vercel URL
3. Update `CORS_ORIGINS` to: `https://your-app.vercel.app`
4. Add any custom domains you configure

**Format**: Comma-separated list
```
https://your-app.vercel.app,https://www.your-domain.com
```

### Step 4: Deploy

#### Automatic Deployment (Recommended)
```bash
git push origin main
```

Vercel automatically deploys on push to main.

#### Manual Deployment (via CLI)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Step 5: Verify Deployment

After deployment completes, test these endpoints:

#### Frontend
```bash
curl https://your-app.vercel.app
```
**Expected**: HTML response (React app)

#### Backend Health Check
```bash
curl https://your-app.vercel.app/api/health
```
**Expected**: 
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T...",
  "uptime": 1.234
}
```

#### API Documentation
Visit in browser: `https://your-app.vercel.app/api-docs`

**Expected**: Swagger UI interface

#### Test Registration
```bash
curl -X POST https://your-app.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
**Expected**: User created response with token

### Step 6: Check Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Check **Build Logs** and **Function Logs**

#### What to Look For:

**Build Logs:**
- ✅ Both frontend and backend builds succeed
- ✅ No TypeScript/linting errors
- ✅ Dependencies install correctly

**Function Logs:**
- ✅ API calls are received
- ✅ No 500 errors
- ✅ CORS working (no CORS errors)

## Post-Deployment Tasks

### Update Frontend API Configuration

If you used a temporary CORS setting, update it now:

1. Note your Vercel URL from deployment
2. Go to Settings → Environment Variables
3. Update `CORS_ORIGINS` to your actual domain
4. Redeploy (push to main or click "Redeploy" in Vercel)

### Set Up Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CORS_ORIGINS` to include custom domain

### Enable Analytics (Optional)

1. Go to Settings → Analytics
2. Enable Web Analytics
3. Track performance and usage

### Configure Deployment Protection (Optional)

1. Go to Settings → Deployment Protection
2. Add password protection for preview deployments
3. Configure team access

## CI/CD Configuration

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Push to `main` branch
- **Preview**: Pull requests and other branches

### Deployment Notifications

Configure in Settings → Git:
- Slack notifications
- Discord webhooks
- Email alerts

### Preview Deployments

Every pull request gets a unique preview URL:
- Test features before merging
- Share with team for review
- Automatically cleaned up after merge

## Troubleshooting

### Build Fails

**Check**:
- [ ] Build logs in Vercel Dashboard
- [ ] Environment variables are set
- [ ] `npm run build` works locally
- [ ] All dependencies in package.json

**Common Issues**:
- Missing environment variables
- Build timeout (increase in settings)
- Out of memory (upgrade plan)

### API Routes Return 404

**Check**:
- [ ] Routes configured in `vercel.json`
- [ ] Backend builds successfully
- [ ] API paths match `/api/*` pattern

**Fix**: Verify `vercel.json` routes section

### CORS Errors

**Check**:
- [ ] `CORS_ORIGINS` includes your domain
- [ ] Backend CORS middleware configured
- [ ] Preflight requests allowed

**Fix**: Update `CORS_ORIGINS` in environment variables

### Frontend Can't Reach Backend

**Check**:
- [ ] `VITE_API_URL` set to `/api`
- [ ] Routes in `vercel.json` correct
- [ ] Backend functions are running

**Fix**: Check Function logs for errors

### JWT Errors

**Check**:
- [ ] `JWT_SECRET` is set
- [ ] Token format is correct
- [ ] Token not expired

**Fix**: Verify JWT_SECRET in environment variables

## Performance Optimization

### Enable Caching

Frontend static assets are cached automatically. For API:
- Add appropriate Cache-Control headers
- Use Vercel's Edge Network

### Monitor Performance

1. Enable Analytics
2. Check Function execution times
3. Monitor cold starts

### Optimize Bundle Size

Frontend:
```bash
# Analyze bundle
npm run build
```

Check `dist/` size and optimize imports.

## Security Checklist

- [ ] JWT_SECRET is secure and unique
- [ ] CORS_ORIGINS properly configured
- [ ] No sensitive data in frontend code
- [ ] Rate limiting enabled in backend
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Environment variables not in Git
- [ ] API routes have proper authentication

## Maintenance

### Regular Updates

1. Keep dependencies updated
2. Monitor Vercel changelog for updates
3. Review Function logs for errors
4. Check Analytics for usage patterns

### Backup Strategy

1. Database: Backend uses file storage (plan for persistence)
2. Code: GitHub repository
3. Configuration: Document environment variables

### Monitoring

Set up:
- [ ] Uptime monitoring (e.g., UptimeRobot)
- [ ] Error tracking (e.g., Sentry)
- [ ] Performance monitoring (Vercel Analytics)

## Support Resources

### Documentation
- This project: `VERCEL_MONOREPO_SETUP.md`
- Vercel: https://vercel.com/docs
- Monorepos: https://vercel.com/docs/concepts/monorepos

### Vercel Support
- Dashboard: https://vercel.com/dashboard
- Support: https://vercel.com/support
- Status: https://www.vercel-status.com/

### Repository
- Issues: https://github.com/avinash6982/TripMakerWeb/issues

## Success Criteria

Your deployment is successful when:

- [x] Build completes without errors
- [x] Frontend loads at your Vercel URL
- [x] API health check responds
- [x] Registration and login work
- [x] API documentation accessible
- [x] No CORS errors in browser console
- [x] Function logs show successful requests

---

**Deployment Complete!** 🎉

Once all checklist items are complete, your monorepo is successfully deployed to Vercel with proper CI/CD.
