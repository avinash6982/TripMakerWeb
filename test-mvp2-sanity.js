#!/usr/bin/env node
/**
 * MVP2 Sanity Test - API verification with multiple users
 * Run: node test-mvp2-sanity.js (with backend on http://localhost:3000)
 */
const BASE = process.env.API_URL || "http://localhost:3000";

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
  const results = [];
  const pass = (msg) => { results.push({ ok: true, msg }); console.log("PASS:", msg); };
  const fail = (msg, err) => { results.push({ ok: false, msg, err }); console.error("FAIL:", msg, err?.message); };

  try {
    // 1. Health
    await fetchJson(`${BASE}/health`);
    pass("Health check");

    const ts = Date.now();
    // 2. Register User A
    const regA = await fetchJson(`${BASE}/register`, {
      method: "POST",
      body: JSON.stringify({ email: `sanity-inviter-${ts}@test.com`, password: "Test123!" }),
    });
    const tokenA = regA.token;
    const idA = regA.id;
    if (!tokenA) throw new Error("No token for User A");
    pass("Register User A (inviter)");

    // 3. Register User B
    const regB = await fetchJson(`${BASE}/register`, {
      method: "POST",
      body: JSON.stringify({ email: `sanity-invitee-${ts}@test.com`, password: "Test123!" }),
    });
    const tokenB = regB.token;
    const idB = regB.id;
    if (!tokenB) throw new Error("No token for User B");
    pass("Register User B (invitee)");

    // 4. User A: Create trip
    const plan = await fetchJson(`${BASE}/trips/plan`, {
      method: "POST",
      body: JSON.stringify({ destination: "Paris", days: 2, pace: "balanced" }),
    });
    const create = await fetchJson(`${BASE}/trips`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        name: "Sanity Test Trip",
        destination: "Paris",
        days: 2,
        pace: "balanced",
        itinerary: plan.itinerary || [],
        isPublic: true,
      }),
    });
    const tripId = create.id;
    if (!tripId) throw new Error("No trip ID");
    pass("User A creates trip");

    // 5. User A: Create invite (editor)
    const invite = await fetchJson(`${BASE}/trips/${tripId}/invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ role: "editor" }),
    });
    const code = invite.code;
    if (!code) throw new Error("No invite code");
    pass(`User A creates invite (code: ${code})`);

    // 6. User B: List trips before redeem
    const tripsBefore = await fetchJson(`${BASE}/trips`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const countBefore = (tripsBefore.trips || []).length;
    pass(`User B trips before redeem: ${countBefore}`);

    // 7. User B: Redeem invite
    const redeem = await fetchJson(`${BASE}/invite/redeem`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ code }),
    });
    if (!redeem.trip) throw new Error("No trip in redeem response");
    pass("User B redeems invite");

    // 8. User B: List trips after redeem
    const tripsAfter = await fetchJson(`${BASE}/trips`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const countAfter = (tripsAfter.trips || []).length;
    if (countAfter <= countBefore) fail("User B should see collaborated trip", new Error(`count ${countAfter} <= ${countBefore}`));
    else pass(`User B sees trip (count: ${countAfter})`);

    // 9. User B: GET trip by ID
    const getTrip = await fetchJson(`${BASE}/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    if (!getTrip.name) throw new Error("Cannot get trip");
    pass("User B can GET trip (collaborator)");

    // 10. User B: PUT trip (editor can update)
    const updated = await fetchJson(`${BASE}/trips/${tripId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ name: "Updated by Editor" }),
    });
    if (updated.name !== "Updated by Editor") throw new Error(`Expected name, got ${updated.name}`);
    pass("User B (editor) can update trip");

    // 11. Public feed (no auth)
    const feed = await fetchJson(`${BASE}/trips/feed`);
    const feedCount = (feed.trips || []).length;
    pass(`Public feed has ${feedCount} trips`);

    // 12. Transport mode
    await fetchJson(`${BASE}/trips/${tripId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ transportMode: "flight" }),
    });
    pass("Transport mode set");

    // 13. User B: DELETE should fail (403)
    const delRes = await fetch(`${BASE}/trips/${tripId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const delData = await delRes.json().catch(() => ({}));
    if (delRes.status === 403) pass("Editor cannot DELETE (403)");
    else if (delRes.status === 404) pass("Editor DELETE returns 404 (trip not in user list)");
    else fail("Editor DELETE should return 403 or 404", new Error(`Got ${delRes.status}`));

    // 14. Invalid redeem code
    try {
      await fetchJson(`${BASE}/invite/redeem`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenB}` },
        body: JSON.stringify({ code: "INVALID1" }),
      });
      fail("Invalid code should fail");
    } catch (e) {
      pass("Invalid invite code returns error");
    }

    // 15. Register User C (viewer), create viewer invite, redeem
    const regC = await fetchJson(`${BASE}/register`, {
      method: "POST",
      body: JSON.stringify({ email: `sanity-viewer-${ts}@test.com`, password: "Test123!" }),
    });
    const tokenC = regC.token;
    const inviteV = await fetchJson(`${BASE}/trips/${tripId}/invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ role: "viewer" }),
    });
    await fetchJson(`${BASE}/invite/redeem`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenC}` },
      body: JSON.stringify({ code: inviteV.code }),
    });
    pass("User C (viewer) redeems invite");

    // 16. User C: PUT should fail (viewer cannot edit)
    const putRes = await fetch(`${BASE}/trips/${tripId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenC}` },
      body: JSON.stringify({ name: "Viewer Update" }),
    });
    const putData = await putRes.json().catch(() => ({}));
    if (putRes.status === 403) pass("Viewer cannot update (403)");
    else if (putRes.status === 404) pass("Viewer cannot update (404 - trip not found)");
    else if (!putRes.ok) pass(`Viewer PUT returned ${putRes.status} (expected fail)`);
    else fail("Viewer should not be able to update");

    // Summary
    const failed = results.filter((r) => !r.ok);
    console.log("\n=== Summary ===");
    console.log(`Passed: ${results.filter((r) => r.ok).length}`);
    if (failed.length) {
      console.log(`Failed: ${failed.length}`);
      failed.forEach((f) => console.log("  -", f.msg, f.err?.message));
      process.exit(1);
    }
    console.log("All sanity tests passed.");
  } catch (err) {
    console.error("Fatal:", err.message);
    process.exit(1);
  }
}

main();
