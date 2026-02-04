# Waypoint - Trip Organization Platform

Welcome to the Waypoint frontend repository! This is a React-based web application for organizing and managing group trips.

## 📚 Documentation Index

We've created comprehensive documentation to help developers understand and work with this codebase.

### 🗺️ [Complete Documentation Map](./DOCUMENTATION_INDEX.md)

For a complete overview of all documentation, when to use each document, and learning paths, see:

**➡️ [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Your guide to navigating all documentation

---

### Quick Navigation

### For All Developers

- **[MASTER_DOC.md](./MASTER_DOC.md)** - Product intent, change log, and overview of the project

### For Backend Developers

⚠️ **Important:** The backend has been upgraded with JWT authentication. This documentation describes the original implementation.

**Start with these (for current backend):**

1. **[Swagger API Documentation](http://localhost:3000/api-docs)** (local) or your Render backend URL + `/api-docs` 🎯 **PRIMARY SOURCE**
   - Always up-to-date API contracts
   - Interactive testing
   - Complete schemas and examples
   - **Use this for all current API information**

2. **[MIGRATION_NOTICE.md](./MIGRATION_NOTICE.md)** ⚠️ **Read first!**
   - Explains JWT changes
   - Migration requirements
   - Current status
   - Action items

3. **Backend Migration Guide** 📖 **For implementation**
   - Location: `TripMakerWeb-BE/FRONTEND_MIGRATION_GUIDE.md`
   - Step-by-step JWT integration
   - Code examples
   - Testing checklist

**Original Documentation (Pre-JWT):**

1. **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** 📋 **Pre-JWT reference**
   - Original API endpoints (no JWT)
   - Useful for understanding old implementation
   - ⚠️ Not current - see Swagger instead

2. **[FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)** 📖 **Pre-JWT guide**
   - Original architecture
   - Pre-JWT authentication flow
   - ⚠️ Not current - see Swagger & migration guide

3. **[INTEGRATION_FLOWS.md](./INTEGRATION_FLOWS.md)** 🗺️ **Pre-JWT flows**
   - Original visual flows
   - ⚠️ Missing JWT token handling

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Server will run on http://localhost:5173
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 🛠️ Technology Stack

- **React** 19.2.3 - UI framework
- **Vite** 7.3.1 - Build tool and dev server
- **React Router** 7.12.0 - Client-side routing
- **i18next** - Internationalization (6 languages supported)

---

## 🌍 Supported Languages

- English (en)
- Hindi (hi)
- Malayalam (ml)
- Arabic (ar)
- Spanish (es)
- German (de)

---

## 📁 Project Structure

```
src/
├── main.jsx              # Application entry point
├── App.jsx               # Root component with routing
├── i18n.js               # Internationalization configuration
├── index.css             # Global styles
├── layouts/
│   ├── AuthLayout.jsx    # Layout for login/register pages
│   └── SiteLayout.jsx    # Layout for authenticated pages
├── pages/
│   ├── Home.jsx          # Main dashboard
│   ├── Login.jsx         # Login page
│   ├── Register.jsx      # Registration page
│   └── Profile.jsx       # User profile settings
└── services/
    ├── auth.js           # Authentication service & API calls
    └── profile.js        # Profile service & API calls
```

---

## 🔗 API Integration

### Backend URL

**Production:** (your Render backend URL)

### Swagger API Documentation (Source of Truth)

⚠️ **IMPORTANT:** The backend now has comprehensive Swagger documentation that should be used as the **single source of truth** for all API contracts:

- **Production Swagger UI:** (your Render backend URL)/api-docs
- **Local Dev Swagger UI:** http://localhost:3000/api-docs
- **OpenAPI Spec (JSON):** (your Render backend URL)/api-docs.json

The Swagger documentation is:
- ✅ Always up-to-date (generated from backend code)
- ✅ Interactive (test endpoints directly)
- ✅ Complete (all schemas, examples, error codes)
- ✅ Can generate TypeScript types

### Backend Migration Required

⚠️ **The backend has been upgraded with JWT authentication**. The frontend documentation in this repo reflects the **old API contract** without JWT tokens. 

**For migration instructions, see:**
- `/Users/avinash1/Documents/projects/cursor_agent/TripMakerWeb-BE/FRONTEND_MIGRATION_GUIDE.md`

**Key changes:**
- Registration now returns `{ id, email, token }`
- Login now returns `{ id, email, token, message }`
- Profile endpoints now accept (optional) `Authorization: Bearer <token>` header

### Configure Backend URL for Local Development

Use **`.env.development`** in `apps/frontend/` (no `.env` in project root required):

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Then restart the dev server.

### API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register` | Create new user account |
| POST | `/login` | Authenticate user |
| GET | `/profile/:userId` | Fetch user profile |
| PUT | `/profile/:userId` | Update user profile |

For complete API documentation, see [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md).

---

## 🔐 Authentication

- Uses localStorage for session persistence
- No token-based auth currently (stateless)
- User data stored in browser localStorage
- Protected routes redirect to login if not authenticated

### Storage Keys

- `waypoint.user` - Current user (id, email)
- `waypoint.profile` - Cached profile data
- `waypoint.language` - Current UI language

---

## 🧪 Testing the Frontend

### With Backend Running Locally

1. Start backend server (e.g., on `http://localhost:3000`)
2. Configure `VITE_API_URL` in `apps/frontend/.env.development` with backend URL
3. Start frontend dev server
4. Test registration, login, and profile features

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Update profile information
- [ ] Change language in UI
- [ ] Logout and verify session cleared
- [ ] Try to access protected routes while logged out
- [ ] Verify localStorage contents

---

## 🐛 Common Issues & Solutions

### CORS Errors

**Problem:** Browser blocks API requests  
**Solution:** Backend must include proper CORS headers. See [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md#cors-configuration).

### Login Fails Silently

**Problem:** No error message shown after login attempt  
**Solution:** Check backend response format. Must return `{ id, email }` on success.

### Profile Not Loading

**Problem:** Profile page shows default/empty values  
**Solution:** Verify `GET /profile/:userId` endpoint returns correct data structure.

### UI Not Translating

**Problem:** Text appears in English only  
**Solution:** Check that language code exists in `src/i18n.js` resources.

---

## 🤝 Contributing

### Making Changes

1. Create a new branch for your feature/fix
2. Make your changes
3. Test thoroughly (registration, login, profile flow)
4. Update documentation if API contract changes
5. Submit a pull request

### Updating API Integration

If you're adding new endpoints or changing existing ones:

1. Update the service files in `src/services/`
2. Update [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
3. Update [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)
4. Add new flows to [INTEGRATION_FLOWS.md](./INTEGRATION_FLOWS.md) if needed

---

## 📦 Deployment

The app is deployed on Vercel:

- **Frontend:** Automatically deployed from `main` branch
- **Backend:** Deployed separately (TripMakerWeb-BE repository)

### Environment Variables for Production

Set in Vercel dashboard:

```bash
VITE_API_URL=http://localhost:3000
```

---

## 📞 Support

### For Backend Developers

If you're working on the backend and have questions about:
- API contracts → [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
- How the frontend uses your endpoints → [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)
- User flows and data → [INTEGRATION_FLOWS.md](./INTEGRATION_FLOWS.md)

### For Frontend Developers

If you're working on the frontend and have questions about:
- Project structure → This README
- Product vision → [MASTER_DOC.md](./MASTER_DOC.md)
- Backend integration → [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)

---

## 📝 License

ISC License

---

## 🎯 Current Status

**Phase:** Account management and profile settings  
**Next:** Trip creation and management features

See [MASTER_DOC.md](./MASTER_DOC.md) for product roadmap and evolution.

---

## Quick Links

- [Production App](https://tripmaker-63b1.onrender.com) (or your Render URL)
- [Backend API](your Render backend URL)
- [GitHub Repository](https://github.com/avinash6982/TripMakerWeb)
- [Backend Repository](https://github.com/avinash6982/TripMakerWeb-BE)

---

**Built with ❤️ for travelers everywhere**
