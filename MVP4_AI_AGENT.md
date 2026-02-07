# MVP4: AI Trip Agent

**Last Updated:** February 2026  
**Status:** Planning complete; implementation not started  
**Purpose:** Chat-based trip creation and editing. AI returns data in the same format as existing `POST /trips/plan` for seamless integration. Provider-agnostic adapter pattern; user supplies API keys after implementation.

---

## 1. Goal and scope

### Goal

Users create and edit trips by **chatting with an AI agent** instead of (or in addition to) selecting from hardcoded destinations. The user can enter **any destination, pace, and days**; the AI generates itinerary data that follows the **same structure** as the current trip plan so integration is seamless. Implementation is **independent of** the specific AI tool/API/model and **scalable** (adapter pattern; add new providers without changing app flow).

### Scope for this phase (MVP4 only)

- **In scope:** Trip **creation** and **editing** via AI (chat flow; backend adapter; fallback to static planner when AI unavailable).
- **Out of scope for MVP4:** Inviting people, prerequisites, visibility, add/remove collaborators, and other actions “through AI” — those are planned for a later phase.

### Principle

Implementation is **provider-agnostic**. Backend exposes an adapter interface; each AI provider (Gemini, Groq, OpenRouter, OpenAI, etc.) is a drop-in implementation. Config (env) selects provider and API key; user provides keys after implementation.

---

## 2. AI provider research summary

*Last verified: February 2026. Rate limits and free tiers change; always check official docs before implementation.*

| Provider | Free tier / notes | Typical limits (check official docs) | Use case for adapter |
|----------|-------------------|-------------------------------------|----------------------|
| **Google Gemini** | Free tier, no card | 5–15 RPM, 100–1000 RPD by model; 250k TPM | Primary candidate; good free tier |
| **Groq** | Free tier | Per-org limits (dashboard); LLaMA etc. | Fast inference; second candidate |
| **OpenRouter** | Free models (`:free`) | 20 RPM, 50 RPD (or 1000/day with $10 top-up) | Single API, many models |
| **Hugging Face Inference** | Free credits (~$0.10/mo) | Rate limits; OpenAI-compatible chat | Alternative; smaller free quota |
| **OpenAI** | Paid (user key) | User-provided key | Adapter supports when user adds key |
| **Anthropic / others** | Paid or trial | User-provided key | Same adapter pattern |

**Recommendation:** Support at least one **free-tier** provider (e.g. Gemini or Groq) so the feature can be tried without payment. Design the adapter so additional providers (OpenAI, etc.) are drop-in via config/keys.

---

## 3. Contract: itinerary format (adapter output)

The AI adapter **must** return the same shape as the current `POST /trips/plan` response so the rest of the app (map, day view, save trip) works unchanged. Source: [apps/backend/server.js](apps/backend/server.js) (e.g. around lines 1168–1229) and [API_REFERENCE.md](API_REFERENCE.md) (Generate Trip Plan).

### Response shape

- **Top level:** `destination` (string), `pace` (string), `days` (number), `generatedAt` (ISO string), `isFallback` (boolean, optional), `meta` (object, optional), **`itinerary`** (array).
- **`itinerary`:** Array of day objects. Each day:
  - `day` (number, 1-based)
  - `area` (string)
  - `totalHours` (number)
  - `slots` (array)
- **Each slot:** `timeOfDay` (`"morning"` | `"afternoon"` | `"evening"`), `totalHours` (number), `items` (array).
- **Each item:** `name` (string), `category` (string), `durationHours` (number).  
  **Categories** (fixed set): `landmark`, `museum`, `park`, `food`, `viewpoint`, `neighborhood`, `market`, `experience`, `nightlife`, `relax`.

### Validation rules (for implementers)

- `days`: 1–10.
- `pace`: one of `relaxed`, `balanced`, `fast` (or aliases used elsewhere).
- Slot `timeOfDay` only: `morning`, `afternoon`, `evening`.
- Category must be from the fixed set above.
- Slot hours should sum to day `totalHours`; item `durationHours` > 0.

### Minimal JSON example

```json
{
  "destination": "Rome",
  "pace": "balanced",
  "days": 2,
  "generatedAt": "2026-02-07T12:00:00.000Z",
  "isFallback": false,
  "meta": {
    "totalStops": 8,
    "avgStopsPerDay": 4,
    "avgHoursPerDay": 6,
    "maxHoursPerDay": 6,
    "maxStopsPerDay": 4
  },
  "itinerary": [
    {
      "day": 1,
      "area": "Historic Center",
      "totalHours": 6,
      "slots": [
        {
          "timeOfDay": "morning",
          "totalHours": 3,
          "items": [
            { "name": "Colosseum", "category": "landmark", "durationHours": 2 },
            { "name": "Roman Forum", "category": "landmark", "durationHours": 1 }
          ]
        },
        {
          "timeOfDay": "afternoon",
          "totalHours": 3,
          "items": [
            { "name": "Trevi Fountain", "category": "landmark", "durationHours": 1 },
            { "name": "Pantheon", "category": "landmark", "durationHours": 1.5 }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. Adapter pattern (backend)

*Description only; no code in this doc.*

### Interface

- **Conceptual name:** e.g. `TripAgentAdapter`.
- **Method:** e.g. `generateTripFromChat(messages, context) -> Promise<PlanResponse>`.
  - **`messages`:** Array of `{ role: 'user'|'assistant', content: string }` (chat history).
  - **`context`:** At least `{ destination?, days?, pace?, currentItinerary? }`. For “edit” flows, pass current itinerary so the AI can modify it.
  - **`PlanResponse`:** Same shape as current `/trips/plan` response (destination, pace, days, itinerary, meta, generatedAt, etc.).

### Implementations

- One implementation per provider: e.g. `GeminiAdapter`, `GroqAdapter`, `OpenRouterAdapter`, `OpenAIAdapter`.
- Each implementation: call the provider’s chat/completion API, then parse and map the response into the contract above (with validation and safe fallback).
- The same adapter will later support “edit” (e.g. “add a day in Rome”, “swap museum X for Y”) by passing `currentItinerary` in context and expecting the same schema back.

### Config

- Backend reads which provider to use and API key from environment (e.g. `TRIP_AGENT_PROVIDER`, `TRIP_AGENT_API_KEY`, or provider-specific keys like `GEMINI_API_KEY`). User provides keys after implementation.

### Fallback

- If no AI config is set or the AI call fails, the backend **falls back** to the existing static trip planner ([api/lib/tripPlanner.js](api/lib/tripPlanner.js) / in-process equivalent in [apps/backend/server.js](apps/backend/server.js)) so the app still works without AI.

---

## 5. UI flow (for implementers)

- **Entry:** User can enter **destination, pace, days** (and optionally “Start over” later).
- **After submit:** Replace the destination/pace/days form with an **AI chat box** that:
  - Sends user messages to the backend; backend uses the adapter to get itinerary updates.
  - Displays AI replies and, when appropriate, an updated itinerary preview (same as current plan preview).
  - Has a **“Start over”** button to go back to destination/pace/days.
- **After trip is created:** In addition to existing UI (e.g. chat button), add an **AI chat FAB** on all relevant screens so further edits to this trip go through the AI. **MVP4 scope:** only trip creation and itinerary edit via this flow.
- **Existing flow:** Keep the existing “generate plan from static data” path working; AI is an **alternative** path that produces the same data format.

---

## 6. Implementation checklist (placeholder)

*Do not implement in the “docs only” pass; this is the checklist for when development starts.*

- [ ] Backend: Define adapter interface and plan response type (JSDoc or comments).
- [ ] Backend: Implement at least one adapter (e.g. Gemini) and wire to env.
- [ ] Backend: New endpoint(s) for “chat” (e.g. POST with messages + context; return plan or error).
- [ ] Backend: Fallback to existing static planner when AI unavailable or fails.
- [ ] Frontend: Replace plan form with AI chat after destination/pace/days (+ “Start over”).
- [ ] Frontend: FAB for AI chat on trip screens; only trip create/edit in MVP4.
- [ ] Docs: Update API_REFERENCE.md and APP_ARCHITECTURE.md when endpoints and flow exist.

---

## 7. Out of scope for MVP4 (future phases)

The following are explicitly **not** in MVP4; they can be “through AI” in a later phase:

- Inviting people (invite codes, collaborators).
- Adding or editing prerequisites (trip checklist).
- Changing visibility (make public / make private).
- Adding or removing collaborators.
- Other trip or account actions driven by chat.

---

## 8. How to enable real AI (fallback chain: Gemini then Groq)

The backend tries AI providers in order; if one fails (e.g. 429), it tries the next, then the static planner. **Order:** (1) Gemini, (2) Groq, (3) static plan if all fail.

### Gemini (primary)

1. **Get an API key** (free tier): [Google AI Studio](https://aistudio.google.com/apikey) → Create API key.
2. **Set one of these in the backend** (in `apps/backend/.env` or `.env.development`, or in Render → Environment):
   - **Option A:** `GEMINI_API_KEY=<your-key>`  
     The backend will use Gemini when this is set; no provider name needed.
   - **Option B:** `TRIP_AGENT_PROVIDER=gemini` and `TRIP_AGENT_API_KEY=<your-key>`

**Groq (fallback):** Get a free key at [Groq Console](https://console.groq.com/keys) and set `GROQ_API_KEY=<your-key>`. If Gemini fails (e.g. 429), the backend tries Groq next. You can set only `GROQ_API_KEY` to use Groq as the sole AI provider.

Restart the backend after changing env. When Gemini fails (e.g. 429), the backend will try Groq if **GROQ_API_KEY** is set. You can also use only Groq (see below). If either key is set and valid, “Plan with AI” and the trip AI FAB will call Gemini; if the key is missing or invalid, the app falls back to the static planner and keeps working.

### If you get 429 (rate limit or quota)

Gemini can return **429** with a message like "You exceeded your current quota". This can be:

- **Rate limit (RPM):** Too many requests in a short time. The backend retries twice (after 3s and 15s). Wait a minute and try again.
- **Free-tier quota:** New or free keys can have low daily/per-minute limits. Check [Google AI Studio](https://aistudio.google.com) → your API key → usage/quota. Enable the "Generative Language API" in Google Cloud if required.
- **Region / billing:** Some regions or new accounts need billing enabled (even for free tier). See [Google AI pricing](https://ai.google.dev/pricing).

When all configured AI providers fail (e.g. 429), the app **still works**: you get a suggested itinerary from the static planner and a short message that the AI was temporarily limited. With both Gemini and Groq keys set, Gemini is tried first, then Groq; you can edit the plan or try again later.

---

**Reference:** [MVP_ROADMAP.md](MVP_ROADMAP.md), [MVP_PLAN.md](MVP_PLAN.md), [API_REFERENCE.md](API_REFERENCE.md) (Generate Trip Plan).
