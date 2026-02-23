/**
 * Trip Agent Gather: conversational step to collect destination, days, pace (and optionally people)
 * before generating an itinerary. Uses the same AI providers (Groq, Gemini) with a dedicated prompt.
 * Returns { message, suggestedContext, complete } so the handler can either ask for more info or generate the plan.
 */

const FETCH_TIMEOUT_MS = Number(process.env.TRIP_AGENT_FETCH_TIMEOUT_MS) || 8_000;

function clampDays(n) {
  if (!Number.isFinite(n)) return null;
  const d = Math.round(Number(n));
  return d >= 1 && d <= 10 ? d : null;
}

function normalizePace(s) {
  const key = String(s || "").toLowerCase().trim();
  if (/relaxed|slow|easy|chill/.test(key)) return "relaxed";
  if (/balanced|medium|steady|moderate/.test(key)) return "balanced";
  if (/fast|active|packed/.test(key)) return "fast";
  return null;
}

/**
 * Build system + user prompt for the "gather context" step.
 * AI must return JSON: { message: string, suggestedContext: { destination?, days?, pace?, people? }, complete: boolean }.
 */
function buildGatherPrompt(messages, context) {
  const current = {
    destination: (context.destination && String(context.destination).trim()) || null,
    days: clampDays(context.days),
    pace: context.pace && normalizePace(context.pace) ? normalizePace(context.pace) : null,
    people: typeof context.people === "number" && context.people >= 1 && context.people <= 20 ? context.people : null,
  };

  const system = `You are a friendly trip-planning assistant. Your job is to collect three things from the user before suggesting an itinerary:
1. **Destination** – city or country (e.g. Paris, Armenia, Tokyo)
2. **How many days** – 1 to 10
3. **Pace** – one of: relaxed, balanced, fast (or similar words: slow/chill = relaxed, medium/moderate = balanced, active/packed = fast)

Optionally you can also note **how many people** (1–20) if the user says it.

Current context we already have: destination=${current.destination || "unknown"}, days=${current.days ?? "unknown"}, pace=${current.pace || "unknown"}${current.people != null ? `, people=${current.people}` : ""}.

Rules:
- Reply with ONLY valid JSON, no markdown or code fences.
- Output exactly: {"message": "...", "suggestedContext": {"destination": "..." or null, "days": number or null, "pace": "relaxed"|"balanced"|"fast" or null, "people": number or null}, "complete": boolean}.
- **complete** is true only when we have a non-empty destination AND a number of days (1–10) AND a pace (relaxed/balanced/fast). Otherwise complete is false.
- **suggestedContext**: merge what you already have (from current context) with what you extract from the user's latest message. Use proper types: destination string (trimmed), days integer 1–10, pace one of relaxed/balanced/fast, people integer 1–20 or omit.
- **message**: a short, friendly reply (1–3 sentences). If context is incomplete, ask for the missing piece(s) in a natural way (e.g. "Armenia sounds great! How many days do you have in mind, and would you prefer a relaxed, balanced, or fast-paced trip?"). If complete, say something like "Got it! Here's your plan." or "Perfect, I'll put together your itinerary." Keep the tone warm and conversational.`;

  const userParts = [
    `Current context: destination=${current.destination || "none"}, days=${current.days ?? "none"}, pace=${current.pace || "none"}.`,
  ];
  for (const m of messages || []) {
    if (m && String(m.role).toLowerCase() === "user" && m.content) userParts.push(`User: ${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`);
    if (m && String(m.role).toLowerCase() === "assistant" && m.content) userParts.push(`Assistant: ${m.content}`);
  }
  userParts.push("Reply with the JSON only (message, suggestedContext with destination/days/pace/people, complete).");

  return { system, user: userParts.join("\n") };
}

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
  if (!res.ok) return { ok: false, status: res.status, errText };
  let data;
  try {
    data = JSON.parse(errText);
  } catch {
    return { ok: false, status: res.status, errText: errText.slice(0, 200) };
  }
  return { ok: true, data };
}

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
  if (!res.ok) return { ok: false, status: res.status, errText };
  let data;
  try {
    data = JSON.parse(errText);
  } catch {
    return { ok: false, status: res.status, errText: errText.slice(0, 200) };
  }
  return { ok: true, data };
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

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Try to gather context using configured AI adapters. Returns { message, suggestedContext, complete, aiUnconfigured?, agentUnavailable? }.
 */
async function gatherContextFromChat(messages, context) {
  const groqKey = (process.env.GROQ_API_KEY || "").trim();
  const geminiKey =
    process.env.TRIP_AGENT_API_KEY && process.env.TRIP_AGENT_PROVIDER === "gemini"
      ? process.env.TRIP_AGENT_API_KEY
      : process.env.GEMINI_API_KEY || "";

  const { system, user } = buildGatherPrompt(messages, context);
  const fullUser = `${system}\n\n${user}`;

  let parsed = null;
  let lastError = null;

  // Try Groq first, then Gemini
  if (isRealApiKey(groqKey)) {
    const body = {
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You respond only with valid JSON. No markdown, no code fences." },
        { role: "user", content: fullUser },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    };
    const result = await callGroqOnce(groqKey, body);
    if (result.ok) {
      const text = result.data.choices?.[0]?.message?.content ?? "";
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        lastError = e;
      }
    } else {
      lastError = new Error(result.errText || `Groq ${result.status}`);
    }
  }

  if (!parsed && isRealApiKey(geminiKey)) {
    const body = {
      contents: [{ role: "user", parts: [{ text: fullUser }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    };
    const result = await callGeminiOnce(geminiKey, body);
    if (result.ok) {
      const text = result.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        lastError = e;
      }
    } else {
      lastError = new Error(result.errText || `Gemini ${result.status}`);
    }
  }

  const noKeys = !isRealApiKey(groqKey) && !isRealApiKey(geminiKey);
  if (noKeys) {
    const userMessages = (messages || []).filter((m) => m && String(m.role).toLowerCase() === "user").map((m) => (typeof m.content === "string" ? m.content : "").trim()).filter(Boolean);
    const lastText = userMessages.length ? userMessages[userMessages.length - 1] : "";
    const looksLikeDestination = lastText.length >= 2 && lastText.length <= 60 && /^[A-Za-z\s\-']+$/.test(lastText) && !/\d/.test(lastText);
    let dest = (context.destination && String(context.destination).trim()) || (looksLikeDestination ? lastText.trim() : null);
    let days = clampDays(context.days);
    let pace = context.pace && normalizePace(context.pace) ? normalizePace(context.pace) : null;
    if (!days && lastText) {
      const dayMatch = lastText.match(/\b(\d+)\s*days?\b/i);
      if (dayMatch) days = clampDays(parseInt(dayMatch[1], 10));
    }
    if (!pace && lastText) {
      const p = normalizePace(lastText);
      if (p) pace = p;
    }
    const hasAll = dest && days != null && pace;
    let message;
    if (hasAll) {
      message = `Here's your ${days}-day ${dest} plan (${pace} pace). You can refine it in chat or save the trip. Add a Gemini or Groq API key for richer AI suggestions.`;
    } else if (dest && !days && !pace) {
      message = `${dest} sounds great! How many days do you have (1–10), and do you prefer a relaxed, balanced, or fast-paced trip?`;
    } else if (dest && days && !pace) {
      message = `${days} days in ${dest} — nice. What pace do you prefer: relaxed, balanced, or fast-paced?`;
    } else {
      message = "I'd love to help plan your trip! Tell me where you want to go (e.g. Armenia), how many days you have (1–10), and your pace: relaxed, balanced, or fast-paced.";
    }
    return {
      message,
      suggestedContext: { destination: dest || null, days: days ?? null, pace: pace || null },
      complete: hasAll,
      aiUnconfigured: true,
    };
  }

  if (!parsed || typeof parsed !== "object") {
    const fallbackMessage =
      (context.destination && String(context.destination).trim())
        ? `${context.destination} sounds great. How many days do you have, and do you prefer a relaxed, balanced, or fast-paced trip?`
        : "Where would you like to go? Tell me the destination, how many days you have (1–10), and your pace (relaxed, balanced, or fast).";
    return {
      message: fallbackMessage,
      suggestedContext: {
        destination: (context.destination && String(context.destination).trim()) || null,
        days: clampDays(context.days) ?? null,
        pace: context.pace && normalizePace(context.pace) ? normalizePace(context.pace) : null,
      },
      complete: false,
      agentUnavailable: true,
    };
  }

  const suggestedContext = parsed.suggestedContext && typeof parsed.suggestedContext === "object" ? parsed.suggestedContext : {};
  const dest = suggestedContext.destination && String(suggestedContext.destination).trim() ? suggestedContext.destination.trim() : (context.destination && String(context.destination).trim()) || null;
  const days = suggestedContext.days != null ? clampDays(suggestedContext.days) : clampDays(context.days);
  const pace = suggestedContext.pace && normalizePace(suggestedContext.pace) ? normalizePace(suggestedContext.pace) : (context.pace && normalizePace(context.pace)) || null;
  const people = typeof suggestedContext.people === "number" && suggestedContext.people >= 1 && suggestedContext.people <= 20 ? suggestedContext.people : (typeof context.people === "number" && context.people >= 1 && context.people <= 20 ? context.people : null);

  const normalized = {
    destination: dest || null,
    days: days ?? null,
    pace: pace || null,
    ...(people != null && { people }),
  };

  const complete = Boolean(
    normalized.destination &&
    normalized.days != null &&
    normalized.pace
  );

  return {
    message: typeof parsed.message === "string" && parsed.message.trim() ? parsed.message.trim().slice(0, 500) : (complete ? "Here's your plan!" : "What else can you tell me? How many days and what pace?"),
    suggestedContext: normalized,
    complete,
    ...(noKeys && { aiUnconfigured: true }),
  };
}

module.exports = {
  buildGatherPrompt,
  gatherContextFromChat,
  normalizePace,
  clampDays,
};
