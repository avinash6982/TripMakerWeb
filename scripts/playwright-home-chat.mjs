#!/usr/bin/env node
/**
 * Playwright script: login, go to Home, type "3 days trip to armenia" in AI chat, submit, capture result.
 * Run: npx playwright run scripts/playwright-home-chat.mjs
 * Or:  node scripts/playwright-home-chat.mjs  (after npm install -D playwright)
 *
 * Requires: npm install -D playwright && npx playwright install chromium
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const DEV_EMAIL = "dev@tripmaker.com";
const DEV_PASSWORD = "DevUser123!";
const CHAT_MESSAGE = "3 days trip to armenia";

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    console.log("1. Navigating to", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    const url = page.url();
    if (url.includes("/login")) {
      console.log("2. On login page, filling credentials (using stable IDs)...");
      await page.locator("#login-email").waitFor({ state: "visible", timeout: 5000 });
      await page.locator("#login-email").fill(DEV_EMAIL);
      await page.locator("#login-password").fill(DEV_PASSWORD);
      await page.locator('form.auth-form button[type="submit"]').waitFor({ state: "visible" });
      await page.locator('form.auth-form button[type="submit"]').click();
      await page.waitForURL(/\/(home|feed)/, { timeout: 15000 });
      console.log("3. Logged in, now on:", page.url());
    }

    if (!page.url().includes("/home")) {
      await page.goto(`${BASE_URL}/home`, { waitUntil: "domcontentloaded" });
    }
    await page.waitForLoadState("networkidle");

    console.log("4. Filling chat input with:", CHAT_MESSAGE);
    const chatInput = page.locator("#agent-chat-input").first();
    await chatInput.waitFor({ state: "visible", timeout: 5000 });
    await chatInput.fill(CHAT_MESSAGE);

    console.log("5. Submitting (click send)...");
    const sendBtn = page.locator(".trip-detail-chat-send").or(page.getByRole("button", { name: /send/i })).first();
    await sendBtn.click();

    console.log("6. Waiting for AI response (up to 30s)...");
    await page.getByText(/updated your plan|days in|itinerary|armenia/i).first().waitFor({ timeout: 30000 });

    console.log("7. Taking screenshot...");
    await page.screenshot({ path: "scripts/playwright-home-chat-result.png", fullPage: true });
    console.log("   Saved: scripts/playwright-home-chat-result.png");

    console.log("8. Keeping browser open 5s for inspection...");
    await page.waitForTimeout(5000);
  } catch (err) {
    console.error("Error:", err.message);
    await page.screenshot({ path: "scripts/playwright-home-chat-error.png", fullPage: true });
    console.log("   Error screenshot: scripts/playwright-home-chat-error.png");
  } finally {
    await browser.close();
  }
}

main();
