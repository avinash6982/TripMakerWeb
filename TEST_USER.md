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
