#!/usr/bin/env node
/**
 * API smoke test: health, login, protected routes (trips, profile).
 * Run: node scripts/smoke-api.js (backend on http://localhost:3000)
 * Dev user: dev@tripmaker.com / DevUser123!
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
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function main() {
  let passed = 0;
  let failed = 0;
  const pass = (msg) => { passed++; console.log("  ✓", msg); };
  const fail = (msg, err) => { failed++; console.error("  ✗", msg, err?.message || err); };

  console.log("Smoke test (API):", BASE, "\n");

  try {
    await fetchJson(`${BASE}/health`);
    pass("GET /health");
  } catch (e) {
    fail("GET /health", e);
  }

  try {
    const login = await fetchJson(`${BASE}/login`, {
      method: "POST",
      body: JSON.stringify({ email: DEV_EMAIL, password: DEV_PASSWORD }),
    });
    if (!login.token || !login.id) throw new Error("Missing token or id");
    const token = login.token;
    const userId = login.id;
    pass("POST /login (dev user)");

    try {
      await fetchJson(`${BASE}/trips`, { headers: { Authorization: `Bearer ${token}` } });
      pass("GET /trips");
    } catch (e) {
      fail("GET /trips", e);
    }

    try {
      await fetchJson(`${BASE}/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      pass(`GET /profile/${userId}`);
    } catch (e) {
      fail("GET /profile/:id", e);
    }

    try {
      const agent = await fetchJson(`${BASE}/trips/agent/chat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hi" }],
          destination: "Rome",
          days: 1,
          pace: "balanced",
        }),
      });
      if (agent.agentUnavailable && !agent.assistantMessage) {
        pass("POST /trips/agent/chat (fallback when AI unconfigured)");
      } else if (agent.assistantMessage != null || agent.itinerary) {
        pass("POST /trips/agent/chat");
      } else {
        pass("POST /trips/agent/chat (response ok)");
      }
    } catch (e) {
      fail("POST /trips/agent/chat", e);
    }
  } catch (e) {
    fail("POST /login", e);
  }

  console.log("\nResult:", passed, "passed,", failed, "failed");
  process.exit(failed > 0 ? 1 : 0);
}

main();
