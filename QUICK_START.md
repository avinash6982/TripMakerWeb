# 🚀 Quick Start Guide

Get TripMaker running locally in 2 minutes!

## Prerequisites

- Node.js v18+ installed
- npm v8+ installed

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This installs all dependencies for both frontend and backend.

### 2. Start Development Servers

```bash
npm run dev
```

This starts both apps simultaneously:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### 3. Open in Browser

Visit: http://localhost:5173

## What's Running?

### Frontend (React/Vite)
- **URL**: http://localhost:5173
- **Code**: `apps/frontend/`
- **Hot reload**: Enabled

### Backend (Express.js API)
- **URL**: http://localhost:3000
- **Code**: `apps/backend/`
- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Environment Configuration

The apps use `.env.development` files which are already configured:

**Frontend** (`apps/frontend/.env.development`):
```env
VITE_API_URL=http://localhost:3000
```

**Backend** (`apps/backend/.env.development`):
```env
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
```

No additional configuration needed for local development!

## Available Scripts

```bash
# Run both apps
npm run dev

# Run individually
npm run dev:frontend
npm run dev:backend

# Build for production
npm run build

# Test backend API
curl http://localhost:3000/health
```

## Testing the API

### Using Swagger UI
Visit http://localhost:3000/api-docs for interactive API documentation.

### Using curl

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register User:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Common Issues

### Port Already in Use

If port 3000 or 5173 is already in use:

1. Stop the process using the port
2. Or change the port in `.env.development`

### Dependencies Not Found

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
npm install
```

### Frontend Can't Connect to Backend

1. Ensure backend is running on http://localhost:3000
2. Check `VITE_API_URL` in `apps/frontend/.env.development`
3. Look for CORS errors in browser console

## Next Steps

- Read `README.md` for full documentation
- Read `CONTRIBUTING.md` for development guidelines
- Read `VERCEL_DEPLOYMENT_GUIDE.md` for deployment instructions
- Explore the code in `apps/frontend/` and `apps/backend/`

## Development Tips

### Frontend Development
- Components: `apps/frontend/src/pages/`
- Layouts: `apps/frontend/src/layouts/`
- API calls: `apps/frontend/src/services/`
- Styles: `apps/frontend/src/index.css`

### Backend Development
- All routes: `apps/backend/server.js`
- API docs: Add Swagger comments above routes
- Test immediately: http://localhost:3000/api-docs

### Hot Reload
Both frontend and backend support hot reload. Changes are reflected automatically!

---

**That's it!** You're ready to start developing. 🎉

For detailed information, see:
- `README.md` - Full documentation
- `VERCEL_DEPLOYMENT_GUIDE.md` - Deployment guide
