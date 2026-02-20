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

- **Production App:** https://trip-maker-pink.vercel.app
- **API Health:** https://trip-maker-pink.vercel.app/api/health
- **API Docs:** (Coming soon)

---

## Quick Test Commands

```bash
# Test login
curl -X POST https://trip-maker-pink.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@tripmaker.com","password":"Demo123456!"}'

# Test health check
curl https://trip-maker-pink.vercel.app/api/health
```
