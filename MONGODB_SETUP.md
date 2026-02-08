# MongoDB Setup for TripMaker

**Last Updated:** February 2026  
**Purpose:** Use a real database (MongoDB Atlas) instead of file-based storage. **Implementation:** Complete. Users and trips are read/written via `lib/db.js` when `MONGODB_URI` is set; otherwise the backend uses file-based storage.

---

## What you need to do

### 1. Create a MongoDB Atlas cluster (free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create an account.
2. Create a new project (e.g. "TripMaker") if you don’t have one.
3. Click **Build a Database** → choose **M0 Free** (512 MB).
4. Pick a cloud provider and region (e.g. AWS, region closest to you or Render).
5. Set a cluster name (e.g. `Cluster0`) and create the cluster.

### 2. Get the connection string

1. In Atlas, go to **Database** → your cluster → **Connect**.
2. Choose **Connect your application**.
3. Copy the connection string. It looks like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Create a database user if prompted:
   - **Database Access** → Add New Database User → Authentication: Password → set username and password. Save the password; you’ll put it in the URI.
5. Replace `<username>` and `<password>` in the URI with that user and password (URL-encode the password if it has special characters).
6. Add the database name to the URI (optional; we use `tripmaker` by default):
   ```text
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/tripmaker?retryWrites=true&w=majority
   ```

### 3. Allow network access

1. In Atlas: **Network Access** → **Add IP Address**.
2. For local dev: add your current IP or use **Allow Access from Anywhere** (`0.0.0.0/0`) for simplicity (Atlas still requires username/password).
3. For Render: add `0.0.0.0/0` so the backend can connect.

### 4. Set the environment variable

**Local (backend):**

- In `apps/backend/` create or edit `.env` (or use `.env.development`).
- Add:
  ```bash
  MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/tripmaker?retryWrites=true&w=majority
  ```
- Do **not** commit `.env` (it’s in `.gitignore`).

**Production (Render):**

1. Open your Render dashboard → backend Web Service.
2. **Environment** → Add variable:
   - Key: `MONGODB_URI`
   - Value: your full connection string (same as above).
3. Save; Render will redeploy.

### 5. Run the app

- **With `MONGODB_URI` set:** Backend uses MongoDB. Start with `npm run dev` (from repo root) or `npm run dev` in `apps/backend/`. On first run, the dev user is seeded into MongoDB.
- **Without `MONGODB_URI`:** Backend falls back to file-based storage (`data/users.json` locally; ephemeral on Render).

### 6. (Optional) Migrate existing file data to MongoDB

If you have important data in `data/users.json` and want it in MongoDB:

1. Ensure `MONGODB_URI` is set (in `.env` or `.env.development` in `apps/backend/`).
2. From repo root:
   ```bash
   node apps/backend/scripts/migrate-file-to-mongo.js
   ```
   The script reads `apps/backend/data/users.json` (or `USER_DB_PATH`) and upserts all users and their trips. You can also run from `apps/backend/` as `node scripts/migrate-file-to-mongo.js`.

---

## Summary checklist

- [ ] MongoDB Atlas account and M0 cluster created  
- [ ] Database user created; connection string has correct username/password and optional DB name  
- [ ] Network access allows your IP and/or `0.0.0.0/0` for Render  
- [ ] `MONGODB_URI` set in `apps/backend/.env` (or `.env.development`) for local dev  
- [ ] `MONGODB_URI` set in Render backend service environment for production  
- [ ] Backend started and dev user seeded (login with `dev@tripmaker.com` / `DevUser123!`)  
- [ ] (Optional) Migration script run if you had existing file data  

---

## Troubleshooting

- **Connection timeout / ECONNREFUSED:** Check Network Access in Atlas (IP allowlist) and that the URI host and port are correct.
- **Authentication failed:** Check username/password in the URI; URL-encode special characters in the password.
- **Database not found:** The app creates the database and collections on first use; ensure the backend has run at least once with `MONGODB_URI` set.
- **Still using file storage:** Ensure `MONGODB_URI` is set in the same environment where the backend runs (e.g. same `.env` file, or Render env vars saved and redeployed).
- **Render: TLS / "tlsv1 alert internal error":** The app now starts the HTTP server first, then connects to MongoDB in the background and retries every 30s. The deploy will succeed and the service will stay up. In Atlas, ensure **Network Access** allows **0.0.0.0/0** (so Render’s outbound IPs can connect). Check Render logs for "MongoDB connect failed (will retry in 30s)" and later "Switched to MongoDB storage" when it connects. Until then, the app uses file storage (ephemeral on Render). If you previously set **NODE_VERSION=18** for the backend to work around TLS, you can remove it and use the default Node; the app no longer blocks startup on MongoDB.
