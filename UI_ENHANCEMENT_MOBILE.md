# UI Enhancement (Mobile Focus)

**Status:** Paused (February 2026)  
**Started:** February 2026  
**Goal:** Improve and enhance the UI with a focus on mobile screens. Each flow is made usable, consistent, and polished on small viewports without breaking desktop. Work is paused; can resume anytime.

**Reference:** [MVP_ROADMAP.md](MVP_ROADMAP.md) (phase listed there); [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) for current tasks.

---

## What this phase is

A **UI enhancement phase** that runs alongside feedback-driven fixes. We explicitly call out:

- **Focus:** Mobile screens (e.g. viewport ≤900px, small phones ≤480px).
- **Principle:** One flow at a time; document what’s done and what’s next.
- **Constraint:** Mobile-only CSS/layout where possible; do not break desktop.

Work is tracked here and in DEVELOPMENT_STATUS so the next round (e.g. trip view, edit) continues in the same way.

---

## Completed flows

### 1. Login & Register

- Mobile layout and alignment improvements so auth screens are usable and consistent on small screens.
- (Specific changes for login/register are documented in DEVELOPMENT_STATUS or applied in earlier design passes.)

### 2. Trip creation flow (Home – Plan with AI & draft itinerary)

All of the following are **mobile-only** (e.g. `@media (max-width: 900px)` or 480px) unless noted.

| Area | Change |
|------|--------|
| **Layout** | Min-heights so stacked sections are usable: Plan with AI card and Draft itinerary card each get `min-height: calc(100vh - var(--header-height) - var(--tabbar-height-safe) - var(--space-8))`. |
| **Draft itinerary** | 480px override removed so the full-height min applies on small phones; no more `max-height: 55vh` / `min-height: 220px` override. |
| **Map** | Route Overview map moved **inside** the draft itinerary section (before the days list) on mobile. Sidebar map and Trending section hidden on mobile; entire sidebar hidden so no empty container. |
| **Map visibility** | `.home-hero-plan-route-mobile` hidden only on desktop (`min-width: 901px`); on mobile the map shows in the plan panel. |
| **Scroll** | Single scroll for draft itinerary: header + map + days scroll together (`.home-hero-plan-content` is the scroll container; `.home-hero-plan-days` no longer a separate scroll). |
| **Day actions** | Regenerate and Edit day are **icon-only** on mobile (refresh and pencil icons); ~30% smaller (31×31px, 14px icon), no border; `aria-label` for accessibility. |
| **App bar** | Waypoint logo vertically centered in the app bar on mobile (nav `align-items: center` at 600px; was `flex-start`). |

### 3. My Trips, Trip Detail, Profile – header and list consistency

App-wide consistency for page headers, list spacing, and touch feedback (mobile and desktop where applicable).

| Area | Change |
|------|--------|
| **Header icons** | Trips page archive and menu buttons use `.page-header-action-round` (same grey border/circle as back button). No `btn ghost` in page headers. |
| **Redeem code** | Removed full-width "Redeem code" block on mobile; action is only in header ⋮ menu. Desktop: unchanged (text button in header). |
| **Trip cards** | Removed "View" button; entire card is a link to trip detail. Added global `.touchable` utility (opacity on hover/active) and applied to trip cards and feed cards. |
| **List + tab bar** | Trips and Feed: extra bottom padding on mobile so last list item is fully visible above the bottom tab bar. |
| **Page header structure** | Profile: added empty `.page-header-actions` span. Feed (no user): use `.page-header-spacer` (same size as back button) so title aligns; Feed title is `<h1>`. Same three-slot layout everywhere. |
| **Trip detail header** | Title in `.page-header-title-wrap` uses `flex: 0 1 auto` so status badge sits next to title; actions group gap `0.5rem` to match other headers. |
| **Gap below app navbar** | All pages: top padding `var(--space-4)`. Trip detail desktop: main `padding-top: var(--space-6)` and `.trip-detail-main` `padding-top: var(--space-4)` so spacing matches /trips and /profile. |
| **Prerequisites (desktop)** | Prerequisites section height matches Map widget; list scrolls when content grows (`.trip-detail-prereq-body` + flex/overflow). |

---

## Next (planned, when resumed)

- **Trip view (Trip Detail):** Mobile layout, map placement, chat FAB, header, and any list/detail views.
- **Edit trip:** Removed from UI Enhancement. The form-based "Edit trip" (name, destination, days) has been removed from the app. **AI chat–based edit trip** is now fully implemented via the **MVP4+ AI Capability Enhancements** phase (see MVP_ROADMAP.md).
- **Other flows:** Discover (Feed), Profile, My Trips, Gallery, etc., as needed.

We will continue to document each flow’s changes here and in DEVELOPMENT_STATUS as we go.

---

## How to continue

1. **Pick a flow** (e.g. Trip view, Trip edit).
2. **Test on mobile** (e.g. 390px width, or 900px for tablet).
3. **Apply mobile-only improvements:** min-heights, scroll containers, icon buttons, alignment, no empty containers.
4. **Update this file** and DEVELOPMENT_STATUS with what was done and what’s next.
5. **Keep desktop unchanged**; use media queries so new rules apply only on mobile.

---

## References

- **Cursor rules:** `.cursor/rules/ui-icon-buttons.mdc` (icon buttons, headers, empty states); `.cursor/rules/browser-for-ui-review.mdc` (use browser for UI review).
- **Design tokens:** `apps/frontend/src/styles/variables.css` (e.g. `--header-height`, `--tabbar-height-safe`, `--space-8`).
- **Breakpoints:** 900px (stacked AI layout, mobile map in plan); 480px (small phones); 600px (nav alignment).

---

**Last Updated:** February 2026 (My Trips / Trip Detail / Profile consistency added)
