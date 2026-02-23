#!/usr/bin/env node
/**
 * Playwright: login, open first trip, open AI panel, send edit message, verify trip updated or message shown.
 * Run: node scripts/playwright-edit-trip.mjs  (frontend + backend must be running)
 * Dev user: dev@tripmaker.com / DevUser123!
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const DEV_EMAIL = "dev@tripmaker.com";
const DEV_PASSWORD = "DevUser123!";
const EDIT_MESSAGE = process.env.EDIT_MESSAGE || "Make it more relaxed";

async function main() {
  const browser = await chromium.launch({ headless: process.env.HEADLESS !== "0" });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    console.log("1. Navigating to", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 15000 });

    if (page.url().includes("/login")) {
      console.log("2. Logging in...");
      await page.locator("#login-email").fill(DEV_EMAIL);
      await page.locator("#login-password").fill(DEV_PASSWORD);
      await page.locator('form.auth-form button[type="submit"]').click();
      await page.waitForURL(/\/(home|trips|feed)/, { timeout: 15000 });
    }

    console.log("3. Going to My Trips...");
    await page.goto(`${BASE_URL}/trips`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const tripLink = page.locator('a[href^="/trip/"]').first();
    const count = await tripLink.count();
    if (count === 0) {
      console.log("   No trips found. Create a trip from Home first.");
      await browser.close();
      process.exit(1);
    }

    console.log("4. Opening first trip...");
    await tripLink.click();
    await page.waitForURL(/\/trip\//, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    console.log("5. Opening AI panel (AI insights / Plan with AI)...");
    const aiTrigger = page.getByText(/AI insights|Plan with AI|Your trip to.*AI/i).first();
    await aiTrigger.click();
    await page.waitForTimeout(500);

    const chatInput = page.locator(".trip-agent-panel input[type=\"text\"]").first();
    await chatInput.waitFor({ state: "visible", timeout: 5000 });

    console.log("6. Sending edit:", EDIT_MESSAGE);
    await chatInput.fill(EDIT_MESSAGE);
    const sendBtn = page.locator(".trip-detail-chat-send").first();
    await sendBtn.click();

    console.log("7. Waiting for response (up to 30s)...");
    await page.getByText(/updated|Applying|Trip updated|days|itinerary|relaxed/i).first().waitFor({ timeout: 30000 });

    const notice = await page.locator(".planner-note, .message").first().textContent().catch(() => "");
    const hasError = await page.locator(".message.error").isVisible().catch(() => false);
    if (hasError) {
      console.error("   Error shown:", await page.locator(".message.error").first().textContent());
      await page.screenshot({ path: "scripts/playwright-edit-trip-error.png" });
      process.exitCode = 1;
    } else {
      console.log("   OK – Response received.", notice ? `Notice: ${notice.slice(0, 60)}...` : "");
    }
  } catch (err) {
    console.error("Error:", err.message);
    await page.screenshot({ path: "scripts/playwright-edit-trip-error.png" }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
