# TripMaker Monorepo

A monorepo containing the TripMaker frontend and backend applications.

## Project Structure

```
TripMaker/
├── apps/
│   ├── frontend/          # React/Vite frontend application
│   └── backend/           # Express.js backend API
├── package.json           # Root package.json with workspace configuration
├── vercel.json           # Vercel deployment configuration
└── README.md
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

## Deployment

This monorepo is configured for Vercel deployment with the following setup:

- **Frontend**: Deployed as a static site from `apps/frontend/dist`
- **Backend**: Deployed as serverless functions with API routes under `/api/*`

### Vercel Configuration

The project uses `vercel.json` to configure the monorepo deployment:
- Frontend builds are handled by `@vercel/static-build`
- Backend is handled by `@vercel/node`
- API routes are prefixed with `/api/`

### CI/CD

Push to `main` branch will automatically trigger a deployment to Vercel.

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

1. Create a feature branch from `main`
2. Make your changes
3. Test locally
4. Push to your branch
5. Create a pull request

## License

ISC
