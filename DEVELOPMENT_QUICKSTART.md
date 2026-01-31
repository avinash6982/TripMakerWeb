# Development Quick Start

**Read this FIRST every dev session**

---

## 🎯 Current Status

**Phase:** MVP1 - Trip Planning Foundation  
**Progress:** 25% (2/7 features complete)  
**Next Task:** Implement trip persistence (CRUD operations)

---

## 📚 Essential Docs (Read in Order)

1. **MVP_ROADMAP.md** - Overall vision and phases
2. **MVP1_TASK_BREAKDOWN.md** - Current sprint tasks
3. **APP_ARCHITECTURE.md** - Technical architecture
4. **API_REFERENCE.md** - API endpoints

---

## 🚨 Rules to Follow

### 1. Transactional Development
✅ Every commit = working app  
❌ No half-implemented features in main

### 2. Scope Discipline
✅ Only implement current MVP phase features  
❌ Don't add "nice to have" features

### 3. Zero Cost (MVP1-3)
✅ Use free services only (Vercel, Leaflet, Nominatim)  
❌ No paid APIs (OpenAI, Google Maps, etc.)

### 4. Documentation
✅ Update docs with every code change  
❌ Don't let docs drift from code

---

## 🏃 Quick Commands

```bash
# Start both frontend & backend
npm run dev

# Frontend only (port 5173)
npm run dev:frontend

# Backend only (port 3000)
npm run dev:backend

# Build for production
npm run build

# Test backend health
curl http://localhost:3000/health

# Test login (dev user)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@tripmaker.com","password":"DevUser123!"}'
```

---

## 🧪 Test User

**Always use for testing:**
- Email: `dev@tripmaker.com`
- Password: `DevUser123!`
- ID: `dev-user-00000000-0000-0000-0000-000000000001`

---

## 📝 Current Sprint Tasks

### ✅ Completed
1. User authentication (register/login)
2. User profile management

### 🔄 In Progress
- Trip persistence (CRUD operations)

### ⏳ Up Next
- Map visualization with Leaflet.js
- Day-wise itinerary view
- Trip editing
- Trip status management
- Transportation hubs (mock data)

---

## 🎯 Before Starting Work

- [ ] Read `MVP1_TASK_BREAKDOWN.md` for current task
- [ ] Check Cursor rules are active (`.cursor/rules/`)
- [ ] Test app is working (`npm run dev`)
- [ ] Confirm task is in current MVP phase

---

## ✅ Before Committing

- [ ] App runs without errors
- [ ] All existing features still work
- [ ] New feature tested end-to-end
- [ ] No console errors
- [ ] Documentation updated
- [ ] Used dev user for testing

---

## 📍 Key Files

### Documentation
- `MVP_ROADMAP.md` - Phase breakdown
- `MVP1_TASK_BREAKDOWN.md` - Current tasks
- `PRODUCT_VISION.md` - Long-term vision

### Code Structure
```
apps/
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── services/      # API calls
│   │   ├── App.jsx        # Routes
│   │   └── i18n.js        # Translations
│   └── package.json
│
└── backend/
    ├── server.js          # Local dev server
    └── data/users.json    # Local storage

api/                       # Vercel serverless functions
├── auth/                  # Login, register
├── user/                  # Profile
├── trips/                 # Trip endpoints (NEW)
└── lib/                   # Shared utilities
    ├── db.js             # User storage
    └── trips.js          # Trip storage (TO ADD)
```

---

## 🐛 Troubleshooting

**App won't start:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend 404 errors:**
- Check `VITE_API_URL` in `apps/frontend/.env.development`
- Should be: `http://localhost:3000`

**Frontend can't connect:**
- Check backend is running on port 3000
- Check CORS origins in backend

**Dev user not working:**
- Dev user is auto-seeded, should always exist
- If not, check `api/lib/db.js` seedUser function

---

## 🚀 Deployment

**Every push to main auto-deploys to Vercel:**
- Frontend: https://trip-maker-pink.vercel.app
- API: https://trip-maker-pink.vercel.app/api

**Test production:**
```bash
# Health check
curl https://trip-maker-pink.vercel.app/api/health

# Test login
curl -X POST https://trip-maker-pink.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@tripmaker.com","password":"DevUser123!"}'
```

---

## 💡 Tips

### Writing Good Commits
```bash
# Good
git commit -m "feat: add trip creation endpoint (MVP1)"

# Bad
git commit -m "wip: stuff"
```

### Feature Branches
```bash
git checkout -b feat/trip-persistence
# Make changes
git add .
git commit -m "feat: implement trip CRUD operations"
git push origin feat/trip-persistence
# Create PR, merge after review
```

### Testing Flow
1. Write code
2. Test locally (`npm run dev`)
3. Test in browser (http://localhost:5173)
4. Test API with curl
5. Commit if all works

---

## 📞 Getting Help

**Documentation issues?**
- Check if doc is outdated in git history
- Update doc and commit with code changes

**Blocked on a task?**
- Document blocker in `MVP1_TASK_BREAKDOWN.md`
- Try alternative approach
- Break task into smaller pieces

**Architecture questions?**
- Consult `APP_ARCHITECTURE.md`
- Check existing patterns in codebase
- Follow Cursor rules in `.cursor/rules/`

---

**Last Updated:** January 31, 2026  
**Next Review:** After each task completion
