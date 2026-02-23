#!/usr/bin/env node
/**
 * Ensure dev user exists: try login; if 401, register dev@tripmaker.com then try login again.
 * Run: node scripts/ensure-dev-user.js
 * Backend must be running (default http://localhost:3000). Use API_URL to override.
 */
const BASE = process.env.API_URL || "http://localhost:3000";
const DEV_EMAIL = "dev@tripmaker.com";
const DEV_PASSWORD = "DevUser123!";

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts.headers },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log("Checking dev user at", BASE, "...");

  let login = await fetchJson(`${BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ email: DEV_EMAIL, password: DEV_PASSWORD }),
  });

  if (login.ok && login.data.token) {
    console.log("OK – Dev user exists. Login succeeded.");
    return;
  }

  if (login.status === 401) {
    console.log("Login failed (401). Registering dev user...");
    const reg = await fetchJson(`${BASE}/register`, {
      method: "POST",
      body: JSON.stringify({ email: DEV_EMAIL, password: DEV_PASSWORD }),
    });
    if (reg.ok && reg.data.id) {
      console.log("OK – Registered dev user. You can log in with", DEV_EMAIL);
      return;
    }
    if (reg.status === 400 && (reg.data.error || "").toLowerCase().includes("already") || (reg.data.error || "").toLowerCase().includes("exist")) {
      console.log("User already exists (register said so). Try restarting the backend to re-seed, or use the correct password.");
      process.exit(1);
    }
    console.error("Register failed:", reg.status, reg.data.error || reg.data);
    process.exit(1);
  }

  console.error("Login failed:", login.status, login.data.error || login.data);
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
