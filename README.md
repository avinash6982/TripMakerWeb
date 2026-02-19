# TripMaker (Waypoint)

**Visual trip planning platform for the entire journey: Plan → Execute → Remember**

> **Current Phase:** Presentable to stakeholders / tester feedback (MVP1–MVP4 complete)  
> **Status:** ✅ Production deployed | 🔄 Tester feedback & fixes  
> **Demo:** https://tripmaker-63b1.onrender.com (or your Render URL)

---

## 🚀 Quick Links

- 📖 **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Complete documentation guide
- 🎯 **[DEVELOPMENT_QUICKSTART.md](DEVELOPMENT_QUICKSTART.md)** - Daily dev workflow
- 🗺️ **[MVP_ROADMAP.md](MVP_ROADMAP.md)** - Feature phases and progress
- 📋 **[MVP1_TASK_BREAKDOWN.md](MVP1_TASK_BREAKDOWN.md)** - Current sprint tasks

---

## 💡 What is TripMaker?

TripMaker solves the fragmentation of traditional trip planning by providing:

1. **Visual Planning** - See your entire trip on an interactive map
2. **Day-wise Breakdown** - Timeline view of activities per day
3. **Real-time Tracking** - Live location during trip execution *(MVP3)*
4. **Collaboration** - Invite friends, share itineraries *(MVP2)*
5. **Trip Memories** - Keep all trip photos and stories in one place *(MVP3)*

---

## 📦 Monorepo Structure

A unified monorepo for the TripMaker travel planning platform, containing both frontend and backend applications.

## Project Structure

```
TripMaker/
├── apps/
│   ├── frontend/          # React/Vite frontend application
│   └── backend/           # Express.js backend API
├── package.json           # Root workspace configuration
├── .cursorrules          # Cursor AI integration
├── QUICK_START.md        # Quick local setup guide
├── CONTRIBUTING.md       # Development guidelines
└── RENDER_DEPLOYMENT_GUIDE.md  # Deployment (Render only)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

Install all dependencies for both frontend and backend:

```bash
npm install
```

### Development

Run both applications in development mode:

```bash
npm run dev
```

Or run them individually:

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### Building

Build both applications:

```bash
npm run build
```

Or build individually:

```bash
# Frontend only
npm run build:frontend

# Backend only (if applicable)
npm run build:backend
```

### Production

Start the backend in production mode:

```bash
npm run start:backend
```

## Documentation

### 📍 Start Here
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - 📚 Complete documentation guide
- **[DEVELOPMENT_QUICKSTART.md](DEVELOPMENT_QUICKSTART.md)** - 🎯 Daily workflow (READ FIRST)
- **[QUICK_START.md](QUICK_START.md)** - ⚡ 2-minute local setup

### 🗺️ Planning & Roadmap
- **[PRODUCT_VISION.md](PRODUCT_VISION.md)** - Long-term vision and business model
- **[MVP_ROADMAP.md](MVP_ROADMAP.md)** - ⭐ MVP phases and feature breakdown
- **[MVP1_TASK_BREAKDOWN.md](MVP1_TASK_BREAKDOWN.md)** - ⭐ Atomic tasks for current sprint

### 🏗️ Architecture & Technical
- **[APP_ARCHITECTURE.md](APP_ARCHITECTURE.md)** - Complete system architecture
- **[API_REFERENCE.md](API_REFERENCE.md)** - API endpoints and data models

### 🚀 Deployment & Contributing
- **[RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)** - Deploy to production (Render only)
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines

## Deployment

This monorepo is deployed on **Render only** (no Vercel):

- **Frontend**: Static site from `apps/frontend/dist`
- **Backend**: Web Service (Node/Express)
- **Env**: No `.env` file required; use `apps/backend/.env.development` and `apps/frontend/.env.development` for local dev. Production: set variables in Render Dashboard.

See **[RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)** for deployment and env setup.

## Applications

### Frontend (apps/frontend)

- **Framework**: React with Vite
- **Features**: Landing page, authentication, i18n support
- **Dev Server**: `http://localhost:5173`

### Backend (apps/backend)

- **Framework**: Express.js
- **Features**: REST API, JWT authentication, rate limiting
- **Dev Server**: `http://localhost:3000` (or as configured)

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for detailed development guidelines.

Quick reference:
1. Create a feature branch from `main`
2. Make your changes and test locally
3. Commit with conventional commit messages
4. Create a pull request

## 🎯 Current MVP Status

### MVP1: Trip Planning Foundation (IN PROGRESS)
- ✅ User authentication and profile management
- 🔄 Trip creation and persistence
- ⏳ Map visualization with markers
- ⏳ Day-wise itinerary view
- ⏳ Trip editing and status management

**Progress:** 25% (2/7 features complete)  
**Target:** February 15, 2026  
**Details:** See [MVP_ROADMAP.md](MVP_ROADMAP.md)

---

## 🧪 Test User

**For all development and testing:**
```
Email: dev@tripmaker.com
Password: DevUser123!
```

---

## 📞 Getting Help

- **Setup issues?** → [QUICK_START.md](QUICK_START.md)
- **Architecture questions?** → [APP_ARCHITECTURE.md](APP_ARCHITECTURE.md)
- **API questions?** → [API_REFERENCE.md](API_REFERENCE.md)
- **What to work on?** → [MVP1_TASK_BREAKDOWN.md](MVP1_TASK_BREAKDOWN.md)
- **All docs index** → [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## License

ISC
