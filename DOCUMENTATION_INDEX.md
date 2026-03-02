# 📚 TripMaker Documentation Index

**Your Guide to All Documentation**

---

## 🚀 Start Here

### New to the Project?
1. **[README.md](README.md)** - Project overview and quick start
2. **[QUICK_START.md](QUICK_START.md)** - 2-minute local setup
3. **[MVP_ROADMAP.md](MVP_ROADMAP.md)** - Current phase and features
4. **[DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)** - Current sprint and progress

### Starting Development Today?
1. **[DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)** - Current sprint focus
2. **[MVP_PLAN.md](MVP_PLAN.md)** - Feature breakdown (MVP1–6)
3. **[MVP_ROADMAP.md](MVP_ROADMAP.md)** - Phase status and next steps
4. **[API_REFERENCE.md](API_REFERENCE.md)** - When adding endpoints

---

## 📋 Documentation by Purpose

### Planning & Roadmap
| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| **[PRODUCT_VISION.md](PRODUCT_VISION.md)** | Long-term vision, business model | Quarterly |
| **[MVP_ROADMAP.md](MVP_ROADMAP.md)** | Phase breakdown, progress tracking | Weekly |
| **[MVP_PLAN.md](MVP_PLAN.md)** | Detailed MVP feature breakdown and phase planning | As needed |
| **[MVP4_AI_AGENT.md](MVP4_AI_AGENT.md)** | MVP4 AI Trip Agent: planning, adapter pattern, itinerary contract | When updating AI |

### Architecture & Technical
| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| **[APP_ARCHITECTURE.md](APP_ARCHITECTURE.md)** | System design, data flow, tech stack | As needed |
| **[API_REFERENCE.md](API_REFERENCE.md)** | All API endpoints and models | Per endpoint |
| **[MONGODB_SETUP.md](MONGODB_SETUP.md)** | MongoDB Atlas setup, MONGODB_URI, migration | Per DB change |

### Development Workflow
| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| **[DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)** | Current sprint, progress, next tasks | Weekly |
| **[QUICK_START.md](QUICK_START.md)** | Local setup instructions | Rarely |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Git workflow, conventions | Rarely |

### Deployment
| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| **[RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)** | Deploy to production (Render only) | Rarely |

### Testing & Reference
| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| **[TEST_USER.md](TEST_USER.md)** | Dev and test user credentials | Rarely |
| **[EVALUATION_REPORT.md](EVALUATION_REPORT.md)** | Snapshot of full project evaluation (API, UI, docs) | When re-running a full eval |

### Cursor AI Integration
| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| **[.cursorrules](.cursorrules)** | Main Cursor AI rules | Per pattern |
| **[.cursor/rules/mvp-development-discipline.mdc](.cursor/rules/mvp-development-discipline.mdc)** | MVP phases and principles | Weekly |
| **[.cursor/rules/browser-for-ui-review.mdc](.cursor/rules/browser-for-ui-review.mdc)** | Use Cursor browser (MCP) for UI review; not Playwright | Rarely |
| **[.cursor/rules/documentation-maintenance.mdc](.cursor/rules/documentation-maintenance.mdc)** | Doc update automation | Rarely |
| **[.cursor/rules/zero-cost-constraint.mdc](.cursor/rules/zero-cost-constraint.mdc)** | Free service enforcement | Rarely |
| **[.cursor/rules/trip-features.mdc](.cursor/rules/trip-features.mdc)** | Trip feature patterns | Per feature |

---

## 🎯 Documentation Update Rules

### Update These Files AUTOMATICALLY

#### When Adding API Endpoints
✅ **[API_REFERENCE.md](API_REFERENCE.md)**
- Add endpoint specification
- Include request/response examples
- Add curl test commands
- Update data models if needed

#### When Completing Features
✅ **[MVP_ROADMAP.md](MVP_ROADMAP.md)**
- Mark feature as complete
- Update progress percentage
- Update "Last Updated" date

✅ **[MVP_PLAN.md](MVP_PLAN.md)**
- Check off completed tasks / phases
- Update sprint timeline and priorities

#### When Changing Architecture
✅ **[APP_ARCHITECTURE.md](APP_ARCHITECTURE.md)**
- Update relevant sections
- Update data flow diagrams (text-based)
- Update technology stack table

#### When Adding Dependencies
✅ **[APP_ARCHITECTURE.md](APP_ARCHITECTURE.md)**
- Add to Technology Stack section
- Document purpose

---

## 📖 Reading Paths

### For Developers

#### First Day
```
1. README.md (5 min)
2. QUICK_START.md (follow setup - 5 min)
3. MVP_ROADMAP.md (15 min)
4. DEVELOPMENT_STATUS.md (5 min)
5. APP_ARCHITECTURE.md (30 min)
```

#### Daily Routine
```
1. DEVELOPMENT_STATUS.md (2 min) – current sprint
2. MVP_PLAN.md / MVP_ROADMAP.md (5 min) – scope
3. [Do work]
4. Update DEVELOPMENT_STATUS.md and docs as needed
```

#### When Adding Features
```
1. Check MVP_ROADMAP.md (is it in scope?)
2. Check MVP_PLAN.md (feature details)
3. Check APP_ARCHITECTURE.md (patterns)
4. Check API_REFERENCE.md (existing APIs)
5. [Implement]
6. Update API_REFERENCE.md (if API added)
7. Update MVP_ROADMAP.md / DEVELOPMENT_STATUS.md as needed
```

---

### For Product Managers

#### Understanding Current State
```
1. PRODUCT_VISION.md (20 min)
2. MVP_ROADMAP.md (15 min)
3. MVP1_TASK_BREAKDOWN.md (10 min)
```

#### Planning Next Phase
```
1. MVP_ROADMAP.md (current progress)
2. PRODUCT_VISION.md (long-term goals)
3. Update MVP_ROADMAP.md (plan next phase)
```

---

### For New Contributors

#### Getting Started
```
1. README.md
2. CONTRIBUTING.md
3. QUICK_START.md
4. Pick a task from MVP1_TASK_BREAKDOWN.md
```

---

## 🔍 Finding Information

### "How do I set up locally?"
→ **[QUICK_START.md](QUICK_START.md)**

### "What are we building?"
→ **[PRODUCT_VISION.md](PRODUCT_VISION.md)**

### "What should I work on today?"
→ **[DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)** and **[MVP_PLAN.md](MVP_PLAN.md)**

### "How does authentication work?"
→ **[APP_ARCHITECTURE.md](APP_ARCHITECTURE.md)** → Authentication Flow

### "What APIs exist?"
→ **[API_REFERENCE.md](API_REFERENCE.md)**

### "How do I deploy?"
→ **[RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)** (Render only)

### "What's the dev user credentials?"
→ **[TEST_USER.md](TEST_USER.md)**

### "What are the development rules?"
→ **[.cursorrules](.cursorrules)** and **[.cursor/rules/](.cursor/rules/)**

---

## 📊 Documentation Health

### Last Updated
| Document | Date | Status |
|----------|------|--------|
| MVP_ROADMAP.md | Jan 31, 2026 | ✅ Current |
| MVP1_TASK_BREAKDOWN.md | Jan 31, 2026 | ✅ Current |
| APP_ARCHITECTURE.md | Jan 31, 2026 | ✅ Current |
| API_REFERENCE.md | Jan 31, 2026 | ✅ Current |
| PRODUCT_VISION.md | Jan 31, 2026 | ✅ Current |

### Coverage
- ✅ Architecture documented
- ✅ API documented
- ✅ MVP phases planned
- ✅ Tasks broken down
- ✅ Development workflow documented
- ✅ Cursor rules configured

---

## 🎯 Quick Reference Cards

### Git Commit Messages
```bash
feat: add trip creation endpoint (MVP1)
fix: resolve map marker positioning bug
docs: update API reference with trip endpoints
style: format trip service code
refactor: extract geocoding utility
test: add trip creation tests
chore: update dependencies
```

### Test User
```
Email: dev@tripmaker.com
Password: DevUser123!
ID: dev-user-00000000-0000-0000-0000-000000000001
```

### Important URLs
```
Local Frontend:  http://localhost:5173
Local Backend:   http://localhost:3000
API Docs:        http://localhost:3000/api-docs
Production:      https://tripmaker-63b1.onrender.com (or your Render URL)
Production API:  (your Render backend URL)
```

---

## 🚨 Documentation Emergency

### "Documentation is outdated!"
1. Read git history to see what changed
2. Update affected docs
3. Commit with docs in same PR as code

### "Can't find what I need!"
1. Check this index
2. Use global search in docs folder
3. Check Cursor rules (`.cursor/rules/`)
4. Ask in team chat

### "Documentation contradicts code!"
1. Code is source of truth
2. Update docs to match code
3. Commit docs update

---

**Maintained By:** TripMaker Development Team  
**Last Updated:** January 31, 2026 (removed redundant docs; index aligned with kept files)  
**Next Review:** Weekly (during sprint planning)
