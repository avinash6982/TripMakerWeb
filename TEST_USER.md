# Test User Credentials

## 🎯 Primary Development User (Auto-Seeded)

**Email:** `dev@tripmaker.com`  
**Password:** `DevUser123!`  
**ID:** `dev-user-00000000-0000-0000-0000-000000000001`  
**Status:** ✅ Always Available (Auto-created on first API call)

**Use this user for:**
- All development work
- Cursor agent testing
- Local development
- Deployed environment testing
- Integration tests

**Benefits:**
- ✅ Consistent across all environments
- ✅ Auto-created on startup
- ✅ Never expires
- ✅ Same credentials everywhere

---

## Additional Test Users (Auto-Seeded)

Same password for all: **`DevUser123!`**

| User   | Email                  | ID        |
|--------|------------------------|-----------|
| Test 1 | `test1@tripmaker.com`  | `test-user-00000000-0000-0000-0000-000000000002` |
| Test 2 | `test2@tripmaker.com`  | `test-user-00000000-0000-0000-0000-000000000003` |

Use these for multi-user flows (e.g. collaboration, invite codes, feed). All three users are seeded on first API call alongside the dev user.

---

## Usage

Use these credentials for:
- Development and testing
- Cursor agent feature development
- Integration testing
- Demo purposes

**⚠️ Important:** These are test accounts. Do not use for production data.

---

## CI / QA test runs (TEST_EMAIL / TEST_PASSWORD)

For full Playwright coverage (auth + nav + home), the test suite expects **TEST_EMAIL** and **TEST_PASSWORD** environment variables. Use either:

1. **Dev user (no signup):**  
   `TEST_EMAIL=dev@tripmaker.com` and `TEST_PASSWORD=DevUser123!`  
   This user is auto-seeded and works in local and deployed environments.

2. **QA accounts from handoff:**  
   After a testing phase, the handoff doc (e.g. `TripMaker-testing/observations/FIRST-DEV-AGENT-HANDOFF.md`) may list one or more test accounts. Use any of those for `TEST_EMAIL` / `TEST_PASSWORD`. Do not commit production passwords.

**Example (dev user):**
```bash
TEST_EMAIL=dev@tripmaker.com TEST_PASSWORD=DevUser123! npm run test:report
```
*(Run from the **testing** repo with the app at `http://localhost:5173`.)*

---

## Test URLs

- **Production:** Use your Render frontend and backend URLs (see [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)).
- **Local:** Frontend http://localhost:5173 · API http://localhost:3000

---

## Quick Test Commands

```bash
# Test login (use your Render API URL or localhost:3000)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@tripmaker.com","password":"DevUser123!"}'

# Test health check
curl http://localhost:3000/health
```
