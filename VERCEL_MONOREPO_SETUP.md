# Vercel Monorepo Setup Guide

This guide will help you set up Vercel deployment for the TripMaker monorepo.

## Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- Repository: `https://github.com/avinash6982/TripMakerWeb`

## Monorepo Structure

```
TripMaker/
├── apps/
│   ├── frontend/     # React/Vite app
│   └── backend/      # Express.js API
├── vercel.json       # Monorepo deployment config
└── package.json      # Root workspace config
```

## Vercel Project Setup

### Step 1: Import or Update Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. If you already have a project for TripMakerWeb:
   - Go to Project Settings
   - Navigate to Git settings
   - Ensure it's connected to `github.com/avinash6982/TripMakerWeb`
3. If creating new:
   - Click "Add New" → "Project"
   - Import from GitHub: `avinash6982/TripMakerWeb`

### Step 2: Configure Build Settings

In your Vercel project settings:

#### General Settings
- **Framework Preset**: Other (we're using custom vercel.json)
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty (handled by vercel.json)
- **Install Command**: `npm install`

#### Build & Development Settings
Override these commands:
```bash
# Build Command
npm run build

# Install Command  
npm install

# Development Command (optional)
npm run dev
```

### Step 3: Environment Variables

Add these environment variables in Vercel Dashboard → Project Settings → Environment Variables:

#### For Backend (Production)
```
NODE_ENV=production
JWT_SECRET=your-jwt-secret-key
API_PORT=3000
```

#### For Frontend (Production)
```
VITE_API_URL=/api
```

**Note**: In the monorepo setup, backend API is accessible at `/api/*` routes, so frontend should use `/api` as the base URL.

### Step 4: Deployment Configuration

The `vercel.json` at the root handles the monorepo deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "apps/backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "apps/frontend/dist/$1"
    }
  ]
}
```

This configuration:
- Builds frontend as static site from `apps/frontend/`
- Builds backend as serverless functions from `apps/backend/`
- Routes `/api/*` to backend
- Routes everything else to frontend

### Step 5: Verify Deployment

After pushing to main:

1. **Check Deployment Status**
   - Go to Vercel Dashboard → Deployments
   - Wait for build to complete

2. **Test Endpoints**
   ```bash
   # Test frontend
   curl https://your-app.vercel.app
   
   # Test backend API
   curl https://your-app.vercel.app/api/health
   ```

3. **Check Logs**
   - Vercel Dashboard → Deployments → Select deployment → Logs
   - Check for any build or runtime errors

## CI/CD Workflow

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Manual Deployment

To manually deploy:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### Build Fails

1. **Check Build Logs**: Vercel Dashboard → Deployments → Failed deployment → Logs
2. **Common Issues**:
   - Missing dependencies: Run `npm install` locally to verify
   - Build errors: Run `npm run build` locally to test
   - Environment variables: Ensure all required vars are set in Vercel

### API Routes Not Working

1. **Check Route Configuration**: Verify `vercel.json` routes
2. **Check Backend Logs**: Vercel Dashboard → Deployments → Functions
3. **CORS Issues**: Ensure backend has proper CORS configuration
4. **Environment Variables**: Verify backend env vars are set

### Frontend Can't Reach Backend

1. **Check API URL**: Frontend should use `/api` as base URL
2. **Check Network Tab**: Look for 404s or CORS errors
3. **Verify Routes**: Ensure routes in `vercel.json` are correct

## Backend CORS Configuration

For the monorepo setup, update your backend CORS configuration:

```javascript
// apps/backend/server.js
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app.vercel.app'] 
    : ['http://localhost:5173'],
  credentials: true
};

app.use(cors(corsOptions));
```

## Local Development vs Production

### Local Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Frontend connects to: `http://localhost:3000/api`

### Production (Vercel)
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.vercel.app/api/*`
- Frontend connects to: `/api` (relative URL)

## Monitoring

1. **Vercel Analytics**: Enable in Project Settings
2. **Deployment Notifications**: Configure in Project Settings → Git
3. **Error Monitoring**: Check Functions logs for backend errors

## Additional Resources

- [Vercel Monorepo Documentation](https://vercel.com/docs/concepts/monorepos)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)
- [Vercel Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)

## Support

For issues:
1. Check Vercel deployment logs
2. Test locally with `npm run dev`
3. Verify `vercel.json` configuration
4. Check GitHub repository connection in Vercel

---

**Last Updated**: January 30, 2026
