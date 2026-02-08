/**
 * Trip Agent: adapter pattern for AI-powered trip planning.
 * Each adapter implements generateTripFromChat(messages, context) -> Promise<PlanResponse>.
 * PlanResponse has the same shape as POST /trips/plan (destination, pace, days, itinerary, meta, generatedAt, isFallback).
 */

const VALID_CATEGORIES = new Set([
  "landmark",
  "museum",
  "park",
  "food",
  "viewpoint",
  "neighborhood",
  "market",
  "experience",
  "nightlife",
  "relax",
]);
const VALID_SLOTS = new Set(["morning", "afternoon", "evening"]);
const VALID_PACES = new Set(["relaxed", "balanced", "fast"]);

function normalizePace(pace) {
  const key = String(pace || "").toLowerCase().trim();
  const map = {
    relaxed: "relaxed",
    slow: "relaxed",
    easy: "relaxed",
    balanced: "balanced",
    medium: "balanced",
    steady: "balanced",
    fast: "fast",
    "fast-paced": "fast",
    active: "fast",
  };
  return map[key] || "balanced";
}

function clampDays(days) {
  if (!Number.isFinite(days)) return 3;
  return Math.min(10, Math.max(1, Math.round(days)));
}

/**
 * Validate and normalize adapter output into PlanResponse shape.
 * @param {object} raw - Parsed JSON from AI
 * @param {{ destination?: string, days?: number, pace?: string }} context
 * @returns {object} PlanResponse
 */
function validateAndNormalizePlan(raw, context) {
  const destination =
    typeof raw.destination === "string" && raw.destination.trim()
      ? raw.destination.trim()
      : (context.destination && String(context.destination).trim()) || "Your Trip";
  const requestedDays = clampDays(
    context.preferredDays ?? Number(raw.days) ?? context.days ?? 3
  );
  const pace = normalizePace(raw.pace || context.pace);

  const itinerary = Array.isArray(raw.itinerary) ? raw.itinerary : [];
  const normalizedItinerary = [];
  for (let i = 0; i < Math.min(itinerary.length, 10); i++) {
    const day = itinerary[i];
    if (!day || typeof day !== "object") continue;
    const dayNum = i + 1;
    const area = typeof day.area === "string" ? day.area : "";
    const slots = Array.isArray(day.slots) ? day.slots : [];
    const normalizedSlots = [];
    let dayTotalHours = 0;
    for (const slot of slots) {
      if (!slot || typeof slot !== "object") continue;
      const timeOfDay = VALID_SLOTS.has(slot.timeOfDay) ? slot.timeOfDay : "morning";
      const items = Array.isArray(slot.items) ? slot.items : [];
      const normalizedItems = items
        .filter((item) => item && typeof item.name === "string" && item.name.trim())
        .map((item) => ({
          name: String(item.name).trim(),
          category: VALID_CATEGORIES.has(item.category) ? item.category : "experience",
          durationHours: Number(item.durationHours) > 0 ? Number(item.durationHours) : 1,
        }));
      const slotHours = normalizedItems.reduce((s, it) => s + it.durationHours, 0);
      dayTotalHours += slotHours;
      normalizedSlots.push({
        timeOfDay,
        totalHours: Number(slotHours.toFixed(1)),
        items: normalizedItems,
      });
    }
    normalizedItinerary.push({
      day: dayNum,
      area,
      totalHours: Number(dayTotalHours.toFixed(1)),
      slots: normalizedSlots,
    });
  }

  const emptyDay = (dayNum) => ({
    day: dayNum,
    area: "",
    totalHours: 0,
    slots: [
      { timeOfDay: "morning", totalHours: 0, items: [] },
      { timeOfDay: "afternoon", totalHours: 0, items: [] },
      { timeOfDay: "evening", totalHours: 0, items: [] },
    ],
  });

  if (normalizedItinerary.length === 0) {
    normalizedItinerary.push(emptyDay(1));
  }

  // Use requested days as canonical: pad or trim itinerary so output has exactly that many days
  while (normalizedItinerary.length < requestedDays) {
    normalizedItinerary.push(emptyDay(normalizedItinerary.length + 1));
  }
  if (normalizedItinerary.length > requestedDays) {
    normalizedItinerary.length = requestedDays;
  }
  const numDays = normalizedItinerary.length;

  const totalStops = normalizedItinerary.reduce(
    (sum, d) => sum + d.slots.reduce((s, slot) => s + slot.items.length, 0),
    0
  );
  const totalHours = normalizedItinerary.reduce((sum, d) => sum + d.totalHours, 0);

  const assistantMessage =
    typeof raw.message === "string" && raw.message.trim()
      ? raw.message.trim().slice(0, 500)
      : undefined;

  return {
    destination,
    pace,
    days: numDays,
    generatedAt: new Date().toISOString(),
    isFallback: false,
    meta: {
      totalStops,
      avgStopsPerDay: numDays ? Number((totalStops / numDays).toFixed(1)) : 0,
      avgHoursPerDay: numDays ? Number((totalHours / numDays).toFixed(1)) : 0,
      maxHoursPerDay: pace === "fast" ? 8 : pace === "relaxed" ? 4.5 : 6,
      maxStopsPerDay: pace === "fast" ? 5 : pace === "relaxed" ? 3 : 4,
    },
    itinerary: normalizedItinerary,
    ...(assistantMessage && { assistantMessage }),
  };
}

/**
 * Build system + user prompt for the model.
 */
function buildPrompt(messages, context) {
  const requestedDays = context.preferredDays != null ? context.preferredDays : (context.days || 3);
  const ctx = {
    destination: context.destination || "unknown",
    days: requestedDays,
    pace: context.pace || "balanced",
    hasCurrentItinerary: Array.isArray(context.currentItinerary) && context.currentItinerary.length > 0,
  };
  const system = `You are a friendly, knowledgeable trip planning assistant. You produce a day-by-day itinerary as a single JSON object and add a short conversational "message" when the user asks a question or when you change the plan.

CRITICAL RULES:
- Respond with ONLY valid JSON, no markdown or code fences.
- You MUST output exactly ${ctx.days} day(s) in the itinerary: the "itinerary" array MUST have exactly ${ctx.days} objects (one per day). The user has requested this; do not ignore it. If you have fewer days, add new day objects; if more, trim to ${ctx.days}.
- Top-level keys: destination (string), pace (string: relaxed|balanced|fast), days (number: must be ${ctx.days}), generatedAt (ISO date string), isFallback (false), meta (object with totalStops, avgStopsPerDay, avgHoursPerDay, maxHoursPerDay, maxStopsPerDay), itinerary (array of exactly ${ctx.days} day objects). Include "message" (string) for a brief reply to the user.
- Each itinerary item: day (1-based number), area (string), totalHours (number), slots (array).
- Each slot: timeOfDay ("morning"|"afternoon"|"evening"), totalHours (number), items (array).
- Each item: name (string), category (one of: landmark, museum, park, food, viewpoint, neighborhood, market, experience, nightlife, relax), durationHours (number).

Context: destination "${ctx.destination}", ${ctx.days} days, pace ${ctx.pace}.

When the user asks to CHANGE the trip (e.g. "make it 5 days", "shorten to 3 days", "more relaxed"): apply the change and output an itinerary with exactly the requested number of days. Set "days" to that number. Add a short "message" confirming the change (e.g. "I've updated it to 5 days and added two more days of activities.").

When the user asks a QUESTION or opinion (e.g. "is this a good trip?", "how good is my plan?", "what do you think?"): your "message" MUST be a direct, short answer that evaluates or advises. BAD: "Here's your 3-day X plan with 12 stops (6 hrs/day)." GOOD: "This plan looks solid—good mix of activities and about 6 hrs/day is sustainable. Ask to add days or change pace if you want." Return the current itinerary unchanged (same days and content).`;
  const userParts = [
    `Context: destination=${ctx.destination}, days=${ctx.days}, pace=${ctx.pace}.`,
  ];
  for (const m of messages) {
    if (m && String(m.role).toLowerCase() === "user" && m.content) userParts.push(`User: ${m.content}`);
    if (m && String(m.role).toLowerCase() === "assistant" && m.content) userParts.push(`Assistant: ${m.content}`);
  }
  userParts.push(
    "Reply with the complete JSON only. Use exactly " + ctx.days + " day(s) in itinerary. Include a \"message\" that answers the user's question or confirms the change (never a generic restatement of the plan)."
  );
  return { system, user: userParts.join("\n") };
}

const FETCH_TIMEOUT_MS = Number(process.env.TRIP_AGENT_FETCH_TIMEOUT_MS) || 8_000;

/**
 * Call Gemini API once. Returns { ok, data, status, errText }.
 */
async function callGeminiOnce(apiKey, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const signal = AbortSignal.timeout ? AbortSignal.timeout(FETCH_TIMEOUT_MS) : undefined;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const errText = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, errText };
  }
  let data;
  try {
    data = JSON.parse(errText);
  } catch {
    return { ok: false, status: res.status, errText: errText.slice(0, 200) };
  }
  return { ok: true, data };
}

/**
 * Gemini adapter: calls Gemini REST API, parses JSON from response.
 * On 429 (rate limit or quota), retries twice: after 3s, then after 15s.
 */
async function geminiGenerateTripFromChat(messages, context, apiKey) {
  const { system, user } = buildPrompt(messages, context);
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${system}\n\n${user}` }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    },
  };

  let result = await callGeminiOnce(apiKey, body);
  if (!result.ok && result.status === 429) {
    await new Promise((r) => setTimeout(r, 3000));
    result = await callGeminiOnce(apiKey, body);
  }
  if (!result.ok && result.status === 429) {
    await new Promise((r) => setTimeout(r, 15000));
    result = await callGeminiOnce(apiKey, body);
  }
  if (!result.ok) {
    throw new Error(`Gemini API error ${result.status}: ${(result.errText || "").slice(0, 200)}`);
  }

  const text = result.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text.trim()) throw new Error("Empty response from Gemini");
  let parsed;
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("AI response was not valid JSON: " + text.slice(0, 150));
  }
  return validateAndNormalizePlan(parsed, context);
}

/**
 * Call Groq API once (OpenAI-compatible chat completions).
 * Returns { ok, data, status, errText }.
 */
async function callGroqOnce(apiKey, body) {
  const signal = AbortSignal.timeout ? AbortSignal.timeout(FETCH_TIMEOUT_MS) : undefined;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });
  const errText = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, errText };
  }
  let data;
  try {
    data = JSON.parse(errText);
  } catch {
    return { ok: false, status: res.status, errText: errText.slice(0, 200) };
  }
  return { ok: true, data };
}

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Groq adapter: OpenAI-compatible chat completions, parses JSON from response.
 * On 429, retries once after 3s.
 */
async function groqGenerateTripFromChat(messages, context, apiKey) {
  const { system, user } = buildPrompt(messages, context);
  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.3,
    max_tokens: 8192,
  };

  let result = await callGroqOnce(apiKey, body);
  if (!result.ok && result.status === 429) {
    await new Promise((r) => setTimeout(r, 3000));
    result = await callGroqOnce(apiKey, body);
  }
  if (!result.ok) {
    throw new Error(`Groq API error ${result.status}: ${(result.errText || "").slice(0, 200)}`);
  }

  const text = result.data.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("Empty response from Groq");
  let parsed;
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("AI response was not valid JSON: " + text.slice(0, 150));
  }
  return validateAndNormalizePlan(parsed, context);
}

/**
 * Create adapter for a given provider.
 * @param {'gemini'|'groq'} provider
 * @param {string} apiKey
 * @returns {{ name: string, generateTripFromChat(messages, context): Promise<object> }|null}
 */
function createTripAgentAdapter(provider, apiKey) {
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return null;
  }
  const key = apiKey.trim();
  if (provider === "gemini") {
    return {
      name: "gemini",
      async generateTripFromChat(messages, context) {
        return geminiGenerateTripFromChat(messages, context, key);
      },
    };
  }
  if (provider === "groq") {
    return {
      name: "groq",
      async generateTripFromChat(messages, context) {
        return groqGenerateTripFromChat(messages, context, key);
      },
    };
  }
  return null;
}

function isRealApiKey(key) {
  if (!key || typeof key !== "string") return false;
  const k = key.trim();
  if (!k.length) return false;
  const lower = k.toLowerCase();
  if (lower.includes("your-") && lower.includes("api-key")) return false;
  if (lower === "xxx" || lower === "xxx..." || k === "sk-...") return false;
  return true;
}

/**
 * Get ordered list of configured adapters to try (Groq first — fast, then Gemini as fallback).
 * Skips placeholder keys so we don't wait on invalid config.
 */
function getTripAgentAdapters() {
  const adapters = [];
  const groqKey = (process.env.GROQ_API_KEY || "").trim();
  if (isRealApiKey(groqKey)) {
    const groq = createTripAgentAdapter("groq", groqKey);
    if (groq) adapters.push(groq);
  }
  const geminiKey =
    process.env.TRIP_AGENT_API_KEY && process.env.TRIP_AGENT_PROVIDER === "gemini"
      ? process.env.TRIP_AGENT_API_KEY
      : process.env.GEMINI_API_KEY || "";
  if (isRealApiKey(geminiKey)) {
    const gemini = createTripAgentAdapter("gemini", geminiKey.trim());
    if (gemini) adapters.push(gemini);
  }
  return adapters;
}

/**
 * Get the default (first) adapter from env, for backward compatibility.
 * TRIP_AGENT_PROVIDER=gemini and TRIP_AGENT_API_KEY or GEMINI_API_KEY.
 */
function getDefaultAdapter() {
  const list = getTripAgentAdapters();
  return list.length > 0 ? list[0] : null;
}

module.exports = {
  createTripAgentAdapter,
  getDefaultAdapter,
  getTripAgentAdapters,
  validateAndNormalizePlan,
  buildPrompt,
};
