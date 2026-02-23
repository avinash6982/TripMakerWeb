#!/usr/bin/env node
/**
 * Playwright: AI gather flow — type only "paris" → must ask for days/pace (no plan yet);
 * then "5 days relaxed" → must show a plan.
 * Run: BASE_URL=http://localhost:5173 npx playwright test scripts/playwright-ai-gather.mjs
 * Or:  node scripts/playwright-ai-gather.mjs
 *
 * If login fails, the script can register a new account and retry.
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const API_URL = process.env.API_URL || "http://localhost:3000";
const DEV_EMAIL = "dev@tripmaker.com";
const DEV_PASSWORD = "DevUser123!";

async function loginOrRegister(page) {
  const url = page.url();
  if (!url.includes("/login") && !url.includes("/register")) return true;
  if (url.includes("/register")) {
    console.log("   On register page — filling and submitting...");
    await page.locator('input[name="email"]').fill(DEV_EMAIL);
    await page.locator('input[name="password"]').fill(DEV_PASSWORD);
    await page.locator('input[name="confirmPassword"]').fill(DEV_PASSWORD);
    await page.locator('form.auth-form button[type="submit"]').click();
    await page.waitForURL(/\/(home|login)/, { timeout: 15000 });
    return page.url().includes("/home");
  }
  console.log("   On login page — filling credentials...");
  await page.locator("#login-email").waitFor({ state: "visible", timeout: 5000 }).catch(() => null);
  if (!(await page.locator("#login-email").count())) {
    console.log("   No #login-email found, trying name=email...");
    await page.locator('input[name="email"]').fill(DEV_EMAIL);
    await page.locator('input[name="password"]').fill(DEV_PASSWORD);
  } else {
    await page.locator("#login-email").fill(DEV_EMAIL);
    await page.locator("#login-password").fill(DEV_PASSWORD);
  }
  await page.locator('form.auth-form button[type="submit"]').click();
  await page.waitForURL(/\/(home|feed|login|register)/, { timeout: 15000 });
  if (page.url().includes("/login")) {
    console.log("   Login may have failed (still on login). Trying register...");
    await page.goto(`${BASE_URL}/register`, { waitUntil: "domcontentloaded" });
    await page.locator('input[name="email"]').fill(DEV_EMAIL);
    await page.locator('input[name="password"]').fill(DEV_PASSWORD);
    await page.locator('input[name="confirmPassword"]').fill(DEV_PASSWORD);
    await page.locator('form.auth-form button[type="submit"]').click();
    await page.waitForURL(/\/(home|login)/, { timeout: 15000 });
  }
  return page.url().includes("/home");
}

async function main() {
  const browser = await chromium.launch({ headless: process.env.HEADLESS !== "0" });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const logs = [];
  const ok = (msg) => {
    logs.push(`OK: ${msg}`);
    console.log("OK:", msg);
  };
  const fail = (msg) => {
    logs.push(`FAIL: ${msg}`);
    console.error("FAIL:", msg);
  };

  try {
    console.log("1. Navigate to", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 15000 });

    const onHome = await (async () => {
      if (page.url().includes("/home")) return true;
      const loggedIn = await loginOrRegister(page);
      if (!loggedIn) {
        fail("Could not login or register");
        return false;
      }
      if (!page.url().includes("/home")) await page.goto(`${BASE_URL}/home`, { waitUntil: "domcontentloaded" });
      return true;
    })();
    if (!onHome) throw new Error("Not on Home");

    ok("On Home");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    // If form is shown (destination field), click "Plan with AI" to open chat
    const planWithAiBtn = page.getByRole("button", { name: /plan with ai/i });
    if (await planWithAiBtn.isVisible().catch(() => false)) {
      await planWithAiBtn.click();
      await page.waitForTimeout(800);
    }

    // Prefer placeholder (works even if testid not in build); fallback id/testid
    const chatInput = page
      .getByPlaceholder(/armenia|tokyo|refine|e\.g\./i)
      .or(page.getByTestId("agent-chat-input"))
      .or(page.locator("#agent-chat-input"))
      .first();
    await chatInput.waitFor({ state: "visible", timeout: 15000 });
    ok("Chat input visible");

    // --- Step A: type only "paris" — must NOT show a full plan; must ask for days/pace
    console.log("2. Sending only 'paris' (no days/pace)...");
    await chatInput.fill("paris");
    await page.locator(".trip-detail-chat-send").first().click();

    console.log("3. Waiting for assistant reply (up to 25s)...");
    await page.getByText(/how many days|sounds great|what pace|relaxed, balanced|1–10/i).first().waitFor({ timeout: 25000 });

    const noItineraryYet =
      (await page.getByText("Your itinerary will appear here").count()) > 0 ||
      (await page.getByText("Your draft itinerary").count()) === 0 ||
      (await page.locator(".planner-day").count()) === 0;
    if (noItineraryYet) {
      ok("After 'paris': no itinerary yet (gather asked for more)");
    } else {
      const dayCount = await page.locator(".planner-day").count();
      if (dayCount > 0) {
        fail(`After 'paris': expected no plan yet but found ${dayCount} day(s) — gather was skipped`);
      } else {
        ok("After 'paris': no day cards (gather flow ok)");
      }
    }

    // --- Step B: send "5 days relaxed"
    console.log("4. Sending '5 days relaxed'...");
    await chatInput.fill("5 days relaxed");
    await page.locator(".trip-detail-chat-send").first().click();

    console.log("5. Waiting for plan (draft itinerary or Day 1)...");
    await page.getByText(/Your draft itinerary|Day 1|Paris/i).first().waitFor({ timeout: 35000 });

    const hasPlan =
      (await page.getByText("Your draft itinerary").count()) > 0 ||
      (await page.locator(".planner-day").count()) >= 1;
    if (hasPlan) {
      ok("After '5 days relaxed': plan shown");
    } else {
      fail("After '5 days relaxed': expected a plan (draft itinerary or Day 1)");
    }

    console.log("6. Screenshot...");
    await page.screenshot({ path: "scripts/playwright-ai-gather-result.png", fullPage: true });
    console.log("   Saved: scripts/playwright-ai-gather-result.png");
  } catch (err) {
    console.error("Error:", err.message);
    fail(err.message);
    await page.screenshot({ path: "scripts/playwright-ai-gather-error.png", fullPage: true });
    console.log("   Error screenshot: scripts/playwright-ai-gather-error.png");
  } finally {
    await browser.close();
  }

  const failed = logs.some((l) => l.startsWith("FAIL:"));
  process.exit(failed ? 1 : 0);
}

main();
