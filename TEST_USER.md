# Test User Credentials

## Primary Test User (UI Created)

**Email:** `demo@tripmaker.com`  
**Password:** `Demo123456!`  
**Created:** 2026-01-30 via browser UI  
**Status:** ✅ Active

## Secondary Test User (API Created)

**Email:** `testuser@tripmaker.com`  
**Password:** `Test123456`  
**ID:** `659475c4-d510-4625-9559-8bb65ffb8ce2`  
**Created:** 2026-01-30 via API  
**Status:** ✅ Active

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
