# Render Deployment Guide

**Last Updated:** February 2026  
**Platform:** Render only (no Vercel). Frontend and API are deployed on Render.

---

## Environment setup (no `.env` required)

- **Local development:** Use `.env.development` only. There is no `.env` file in the repo.
  - **Backend:** `apps/backend/.env.development` — the server loads it when `NODE_ENV=development` or when `.env` is missing.
  - **Frontend:** `apps/frontend/.env.development` — Vite uses it for `VITE_API_URL`.
- **Production (Render):** Set all variables in the Render Dashboard for each service. Do not rely on `.env` or `.env.development` on the server.

See **apps/backend/.env.example** and **.env.example** (root) for variable names and descriptions.

---

## One backend + one static frontend (recommended)

1. **Backend (Web Service)**  
   - New Web Service → connect repo → root directory: repo root (or where `apps/backend` and `api` live).  
   - Build: `npm install && (cd apps/backend && npm install)` (or your actual backend build).  
   - Start: `node apps/backend/server.js` (or `npm run start --workspace=apps/backend` from root).  
   - **Environment (Render Dashboard):**  
     - `NODE_ENV=production`  
     - `JWT_SECRET` = generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`  
     - `CORS_ORIGINS` = your frontend URL (e.g. `https://tripmaker-63b1.onrender.com`)  
     - Optional: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` for media.

2. **Frontend (Static Site)**  
   - New Static Site → connect same repo.  
   - Build: `npm install && npm run build` (or `cd apps/frontend && npm run build`).  
   - Publish directory: `apps/frontend/dist`.  
   - **Environment:**  
     - `VITE_API_URL` = your backend URL (e.g. `https://tripmaker-63b1-api.onrender.com`).

3. **SPA reload (static site)**  
   - Reloading a deep link (e.g. `/home`, `/trips`) can show "Not Found" because the server looks for a file at that path. The app is a **Single Page Application**: only `index.html` exists; React Router handles routes in the browser.  
   - **Fix:** In Render Dashboard → your **Static Site** → **Settings** → **Redirects/Rewrites**. Add a **Rewrite**: Source `/*`, Destination `/index.html`, Action **Rewrite** (not Redirect). Save. After this, reloading any path serves `index.html` and the app loads correctly.  
   - See [Render: Static Site Redirects and Rewrites](https://docs.render.com/redirects-rewrites).

4. **Verification**  
   - **Frontend:** Open your static site URL → login page loads; log in with `dev@tripmaker.com` / `DevUser123!`.  
   - **Backend:** `curl https://your-api.onrender.com/health` → `{"status":"ok"}` (or your health response).  
   - **API from frontend:** After setting `VITE_API_URL`, login and API calls should succeed from the deployed frontend.

---

## Required environment variables (production)

| Variable        | Where        | Required | Notes |
|----------------|--------------|----------|--------|
| `JWT_SECRET`   | Backend      | Yes      | 64-char hex; generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV`     | Backend      | Yes      | `production` |
| `CORS_ORIGINS` | Backend      | Yes      | Your frontend URL (e.g. `https://your-app.onrender.com`) |
| `VITE_API_URL` | Frontend     | Yes      | Your backend API URL (e.g. `https://your-api.onrender.com`) |
| `R2_*`         | Backend      | No       | Optional; for media upload (MVP3.6) |

---

## R2 CORS (attach image / media upload)

If you use **attach image** in trip chat (MVP3.6), the browser uploads directly to Cloudflare R2 via a presigned URL. That request is cross-origin, so the **R2 bucket must have CORS configured** or you’ll see:

`Access to fetch at 'https://...r2.cloudflarestorage.com/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Fix:** In the Cloudflare dashboard, add a CORS policy to your R2 bucket:

1. Go to **R2 object storage** → select bucket (e.g. `tripmaker-media`) → **Settings**.
2. Under **CORS Policy**, choose **Add CORS policy**.
3. Open the **JSON** tab and paste (adjust origins if needed):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://tripmaker-63b1.onrender.com"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type", "x-amz-checksum-crc32", "x-amz-sdk-checksum-algorithm", "x-amz-content-sha256"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

4. **Save**.

- **AllowedOrigins:** Your frontend origin(s) — add your production URL if different from above.
- **AllowedMethods:** `PUT` for uploads, `GET`/`HEAD` for viewing media.
- **AllowedHeaders:** Must include any header the browser sends (e.g. `Content-Type` and the `x-amz-*` headers the SDK may add).

Changes can take up to ~30 seconds to apply. After saving, try attach image again from `http://localhost:5173` (or your frontend URL).

---

## Quick reference

- **Local:** No `.env` file needed; use `apps/backend/.env.development` and `apps/frontend/.env.development`.
- **Production:** Set variables in Render Dashboard only.
- **SPA 404 on reload:** Add rewrite `/*` → `/index.html` (Rewrite) in Static Site settings.
- **Test user:** `dev@tripmaker.com` / `DevUser123!`
