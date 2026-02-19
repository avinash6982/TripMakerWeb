# Scripts

## UI review and testing

**Use the Cursor browser (MCP: cursor-ide-browser) for UI review**, including the home screen with/without a trip at multiple screen sizes (desktop, tablet, mobile). See `.cursor/rules/browser-for-ui-review.mdc`.

## Playwright (optional)

The Playwright script can reproduce the Home AI chat flow: login → Home → type "3 days trip to armenia" → submit → screenshot. Prefer the browser MCP for routine review.

Login uses the **dev user** (`dev@tripmaker.com` / `DevUser123!`) and stable selectors: `#login-email`, `#login-password`, and `form.auth-form button[type="submit"]`. If you change the login page, keep these IDs/selectors or update `scripts/playwright-home-chat.mjs`.

### One-time setup

```bash
npm install
npx playwright install chromium
```

### Run

1. Start the app in another terminal: `npm run dev`
2. Run the Playwright script:

```bash
npm run test:playwright
```

Or with a custom base URL:

```bash
BASE_URL=http://localhost:5173 node scripts/playwright-home-chat.mjs
```

### Output

- **Success:** `scripts/playwright-home-chat-result.png` (full-page screenshot after the AI responds)
- **Failure:** `scripts/playwright-home-chat-error.png`

The browser opens in headed mode (visible) and stays open ~5 seconds at the end so you can inspect the UI.
