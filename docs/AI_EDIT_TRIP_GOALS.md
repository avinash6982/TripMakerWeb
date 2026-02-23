# AI Integration & Edit Trip Flow — 10-Round Goal List

**Purpose:** Recursively evaluate and improve AI integration and edit-trip flow; align with MVP roadmap (MVP4 / MVP4+); follow international standards; make edit trip fully functional and feature-rich.

**Process:** Set goals → Implement → Test (browser + Playwright) → Re-evaluate → Set goals again; repeat for 10 rounds.

---

## Round 1 — Robustness: Edit flow and API response handling

**Goals:**
1. **Trip Detail:** Handle `contextIncomplete` — when API returns `contextIncomplete: true` or missing `itinerary`, do not call `updateTrip`; show assistant message only and keep existing trip data.
2. **Trip Detail:** Validate `planResponse` has a valid `itinerary` (array, length ≥ 1) before calling `updateTrip`; otherwise show message and do not persist.

**Success:** Edit chat never overwrites trip with empty/invalid data; user sees AI reply when context is incomplete.

---

## Round 2 — Backend: Edit mode shortcut

**Goals:**
3. **Backend:** When context has `currentItinerary` (non-empty array) and full context (`destination`, `days`, `pace`), skip the gather step and go straight to plan generation so edit flow is fast and never returns `contextIncomplete` for a valid edit.

**Success:** Trip Detail edit requests always get a plan (or explicit question reply with unchanged itinerary), never stuck in gather.

---

## Round 3 — AI prompt: Edit-specific instructions

**Goals:**
4. **Backend:** In `buildPrompt`, when `hasCurrentItinerary` is true, add explicit edit instructions: modify existing itinerary per user request (e.g. "add a day for X", "remove day 2", "make it more relaxed", "add wine tasting"), preserve structure (days, slots, categories), output full JSON with updated itinerary.

**Success:** AI reliably returns modified itinerary for edit requests (add/remove day, change pace, add activity).

---

## Round 4 — Edit UX and i18n

**Goals:**
5. **Trip Detail:** Show clear "Applying changes…" / "Trip updated" or error after AI edit; optional scroll to itinerary after update.
6. **i18n:** Add/edit strings for edit flow: "Trip updated with your changes", "Applying changes…", edit-specific placeholders.

**Success:** User gets clear feedback when AI edits are applied or fail.

---

## Round 5 — Automated tests

**Goals:**
7. **Playwright:** Add script for edit-trip flow: open trip → open AI panel → send "add a day for wine tasting" (or similar) → wait for success and verify trip updated (or message shown).
8. **Browser checklist:** Add edit-trip steps to MVP1_BROWSER_TEST_CHECKLIST or equivalent.

**Success:** Edit flow covered by automated and manual tests.

---

## Round 6 — Seamless integration and validation

**Goals:**
9. **Frontend:** Ensure AI response data (destination, days, pace, itinerary) is validated (shape, day count) before `updateTrip`; normalize if needed to match backend contract.
10. **Backend:** Ensure adapter output is validated/normalized so invalid AI JSON never reaches the client (already partially in `validateAndNormalizePlan`).

**Success:** Only valid itinerary shapes are persisted; no crashes from malformed AI response.

---

## Round 7 — Richer edit capabilities

**Goals:**
11. Support "add day", "remove day N", "swap day 1 and 2", "add [activity] to day 2" in prompt and normalization.
12. Optional: trip name change via AI ("rename this trip to X") and persist via `updateTrip(id, { name })`.

**Success:** Users can perform common edit operations via natural language.

---

## Round 8 — Error handling and retry

**Goals:**
13. **Trip Detail:** On `updateTrip` failure after AI success, show error and keep assistant message; do not clear chat or trip state.
14. **Backend:** Document rate limits and suggest retry (e.g. 429); optional retry in frontend for 5xx.

**Success:** Transient failures don’t leave the UI in a broken state.

---

## Round 9 — Accessibility and standards

**Goals:**
15. **A11y:** AI panel and edit flow meet WCAG 2.1 AA where applicable (labels, focus, errors).
16. **i18n:** All new strings in 6 languages (en, hi, ml, ar, es, de) for edit flow.

**Success:** Edit flow accessible and localized.

---

## Round 10 — Polish and re-evaluation

**Goals:**
17. Full pass: run all tests (Playwright + smoke + browser checklist); fix regressions.
18. Re-evaluate: document remaining gaps and future improvements (e.g. rich AI insights section, "trip starting in X days").

**Success:** Edit trip flow fully functional, tested, and documented.

---

---

## Implementation status (summary)

| Round | Status | Notes |
|-------|--------|--------|
| 1 | Done | Trip Detail: contextIncomplete + valid itinerary check; no PUT when incomplete/invalid |
| 2 | Done | Backend: edit mode skips gather when currentItinerary + full context |
| 3 | Done | Backend: buildPrompt edit-mode block + current itinerary in user message |
| 4 | Done | Trip Detail: applyingChanges / tripUpdated notice; i18n keys |
| 5 | Done | Playwright script `scripts/playwright-edit-trip.mjs`; browser checklist updated |
| 6 | Done | Frontend `tripPlanValidation.js`; backend `validateAndNormalizePlan`; only valid shapes persisted |
| 7 | Done | Edit prompt: add/remove/swap day, add activity; optional trip name in response and updateTrip |
| 8 | Done | Trip Detail: retry updateTrip once on failure; agentError shown; API_REFERENCE 429/retry note |
| 9 | Done | i18n: tripUpdated/applyingChanges in all 6 languages; AI panel role=dialog, aria-labelledby, aria-label, close i18n |
| 10 | Done | Smoke + Playwright login + edit-trip script run; doc updated; remaining gaps below |

**Last updated:** February 2026  
**Branch:** dev_ai_enhancements

---

## Remaining gaps and future improvements

- **Rich AI insights section:** Dedicated UI block for “AI suggestions” or “Things to know” (e.g. weather, local tips) from the agent, separate from the itinerary.
- **Trip context in UI:** e.g. “Trip starting in X days” or countdown on Trip Detail / Home when trip has a start date.
- **Structured edit commands:** Optional UI shortcuts (e.g. “Add day”, “Remove day 2”) that send structured requests to the agent for more reliable parsing.
- **Rate limit UX:** When backend returns 429, show a specific “temporarily limited” message and a retry-after hint (backend could expose Retry-After if available).
- **Offline/edit parity:** When AI is unconfigured, edit panel could still allow manual itinerary edits (add/remove slots) without calling the agent.
