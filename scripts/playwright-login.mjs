#!/usr/bin/env node
/**
 * Playwright: login only. Uses dev user dev@tripmaker.com / DevUser123!
 * Run: node scripts/playwright-login.mjs   (or npx playwright run scripts/playwright-login.mjs)
 * Requires: frontend on BASE_URL, backend on API (e.g. npm run dev).
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const DEV_EMAIL = "dev@tripmaker.com";
const DEV_PASSWORD = "DevUser123!";

async function main() {
  const browser = await chromium.launch({ headless: process.env.HEADLESS !== "0" });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    console.log("1. Navigating to", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 15000 });

    const url = page.url();
    if (!url.includes("/login") && !url.includes("/register")) {
      console.log("   Already on", url, "- might be logged in or landing page");
      const hasHome = await page.locator('a[href="/home"], [href="/trips"]').first().isVisible().catch(() => false);
      if (hasHome) {
        console.log("2. Login not required (already authenticated). OK.");
        await browser.close();
        process.exit(0);
      }
    }

    if (page.url().includes("/login")) {
      console.log("2. On login page, filling credentials...");
      await page.locator("#login-email").waitFor({ state: "visible", timeout: 5000 });
      await page.locator("#login-email").fill(DEV_EMAIL);
      await page.locator("#login-password").fill(DEV_PASSWORD);
      await page.locator('form.auth-form button[type="submit"]').click();
      await page.waitForURL(/\/(home|trips|feed)/, { timeout: 15000 });
      console.log("3. Logged in. Now at:", page.url());
    }

    const finalUrl = page.url();
    if (finalUrl.includes("/home") || finalUrl.includes("/trips") || finalUrl.includes("/feed")) {
      console.log("OK – Login succeeded.");
      process.exitCode = 0;
    } else {
      const errText = await page.locator(".message.error, [role=alert]").first().textContent().catch(() => "");
      console.error("FAIL – Still at", finalUrl, errText ? `Error: ${errText}` : "");
      await page.screenshot({ path: "scripts/playwright-login-error.png" });
      console.log("   Screenshot: scripts/playwright-login-error.png");
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("Error:", err.message);
    await page.screenshot({ path: "scripts/playwright-login-error.png" }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
