# TripMaker Monorepo

A unified monorepo for the TripMaker travel planning platform, containing both frontend and backend applications.

## Project Structure

```
TripMaker/
├── apps/
│   ├── frontend/          # React/Vite frontend application
│   └── backend/           # Express.js backend API
├── package.json           # Root workspace configuration
├── vercel.json           # Vercel deployment config
├── .cursorrules          # Cursor AI integration
├── QUICK_START.md        # Quick local setup guide
├── CONTRIBUTING.md       # Development guidelines
└── VERCEL_DEPLOYMENT_GUIDE.md  # Deployment instructions
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

- **[QUICK_START.md](QUICK_START.md)** - Get running locally in 2 minutes
- **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** - Deploy to Vercel
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines

## Deployment

This monorepo is configured for Vercel deployment:

- **Frontend**: Static site from `apps/frontend/dist`
- **Backend**: Serverless functions at `/api/*` routes
- **CI/CD**: Push to `main` → automatic deployment

See **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** for detailed deployment instructions.

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

## License

ISC
