/**
 * Trip Agent Chat — single pipeline from scratch.
 *
 * Flow (MVP4+): First run a "gather" step to ensure we have destination, days, and pace before generating any itinerary.
 * If context is incomplete, return a conversational reply and suggestedContext (no plan). Once complete, generate the plan.
 *
 * User goals (from product):
 * 1. When user says only "Armenia" (or a destination), ask for days and pace — do not suggest an itinerary until we have all three.
 * 2. Change trip length when user says "Make it 5 days", "for 6 days instead" → plan and UI show new days; reply confirms the change.
 * 3. Answer questions ("Is 3 days enough?") with a SHORT reply.
 */

const { getTripAgentAdapters } = require("./tripAgent");
const { gatherContextFromChat } = require("./tripAgentGather");

/** Get plain text from message content (string or parts array). */
function getMessageText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((p) => (p && typeof p.text === "string" ? p.text : ""))
    .join(" ")
    .trim();
}

/**
 * From the last user message, detect requested days and whether it's a day-change request.
 * Day-change = clear request to change length ("make it 5", "for 6 days", "5 days instead").
 * Not day-change = question ("is 3 days enough?", "worth 3 days") → we still parse 3 for context but reply with short answer.
 */
function getRequestedDaysFromLastMessage(lastUserText, contextDays) {
  const s = typeof lastUserText === "string" ? lastUserText.trim().toLowerCase() : "";
  const context = Math.min(10, Math.max(1, Number(contextDays) || 3));

  if (!s) {
    return { requestedDays: context, isDayChangeRequest: false };
  }

  const clamp = (n) => Math.min(10, Math.max(1, parseInt(n, 10)));
  const looksLikeQuestion = /\?|enough|worth|good|think|how\s+many|should i|can i|is\s+(this|it|that)/i.test(s);

  // 1) Clear imperative: "make it 5", "then make it 5", "change to 5", "want 5" → day change
  let m = s.match(/(?:make\s+it|make\s+this(?:\s+trip)?|change\s+to|extend\s+to|shorten\s+to|want)\s+(\d+)(?:\s*days?)?\b/i);
  if (m && m[1]) return { requestedDays: clamp(m[1]), isDayChangeRequest: true };

  // 2) "for 5 days", "trip for 5 days" → day change only if not a question (e.g. "is X good for 3 days" is a question)
  m = s.match(/(?:trip\s+)?for\s+(\d+)\s*days?(?:\s+instead|\s+please)?/i);
  if (m && m[1]) return { requestedDays: clamp(m[1]), isDayChangeRequest: !looksLikeQuestion };

  // 3) "5 days instead", "5 days please" → day change
  m = s.match(/\b(\d+)\s*days?\s+(?:instead|please)/i);
  if (m && m[1]) return { requestedDays: clamp(m[1]), isDayChangeRequest: true };

  // 4) Bare "5 days" or "5 day" → day change only if message does NOT look like a question
  m = s.match(/\b(\d+)\s*days?\b/i);
  if (m && m[1]) {
    const num = clamp(m[1]);
    return { requestedDays: num, isDayChangeRequest: !looksLikeQuestion };
  }

  return { requestedDays: context, isDayChangeRequest: false };
}

/**
 * Ensure plan has exactly n days (pad or trim itinerary); update plan.days and plan.meta.
 * Mutates plan.
 */
function normalizePlanToDays(plan, n) {
  if (!plan || !Array.isArray(plan.itinerary) || n == null) return plan;
  const requested = Math.min(10, Math.max(1, Number(n) || 3));
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
  while (plan.itinerary.length < requested) {
    plan.itinerary.push(emptyDay(plan.itinerary.length + 1));
  }
  if (plan.itinerary.length > requested) plan.itinerary.length = requested;
  plan.days = requested;
  const totalStops = plan.itinerary.reduce(
    (sum, d) => sum + (d.slots || []).reduce((s, slot) => s + (slot.items || []).length, 0),
    0
  );
  const totalHours = plan.itinerary.reduce((sum, d) => sum + (d.totalHours || 0), 0);
  plan.meta = {
    ...plan.meta,
    totalStops,
    avgStopsPerDay: requested ? Number((totalStops / requested).toFixed(1)) : 0,
    avgHoursPerDay: requested ? Number((totalHours / requested).toFixed(1)) : plan.meta?.avgHoursPerDay ?? 0,
  };
  return plan;
}

/**
 * Short reply for questions (is X enough? / worth it?). No long "This N-day X plan with Y stops…".
 */
function shortQuestionReply(plan, requestedDays, destination) {
  const d = plan.destination || destination || "your trip";
  const n = requestedDays ?? plan.days ?? 3;
  return `${n} days works well for a focused trip to ${d}. Ask to add more days or change the pace if you'd like.`;
}

/**
 * Main handler: messages + context → { plan?, assistantMessage, contextIncomplete?, suggestedContext?, aiUnconfigured?, agentUnavailable? }.
 * Runs gather step first; only generates an itinerary when destination, days, and pace are all present.
 * Edit mode: when context has currentItinerary and full destination/days/pace, skip gather and go straight to plan generation.
 */
async function handleTripAgentChat({ messages = [], context = {}, buildTripPlan }) {
  const isEditMode =
    Array.isArray(context.currentItinerary) &&
    context.currentItinerary.length > 0 &&
    context.destination &&
    String(context.destination).trim() &&
    context.days != null &&
    Number(context.days) >= 1 &&
    Number(context.days) <= 10 &&
    context.pace &&
    String(context.pace).trim();

  let gather;
  if (!isEditMode) {
    gather = await gatherContextFromChat(messages, context);
    const hasFullContext =
      gather.suggestedContext &&
      gather.suggestedContext.destination &&
      gather.suggestedContext.days != null &&
      gather.suggestedContext.pace;

    if (!gather.complete || !hasFullContext) {
      return {
        plan: null,
        assistantMessage: gather.message,
        contextIncomplete: true,
        suggestedContext: gather.suggestedContext || {},
        aiUnconfigured: gather.aiUnconfigured || undefined,
        agentUnavailable: gather.agentUnavailable || undefined,
      };
    }
  }

  const destination = isEditMode
    ? (context.destination && String(context.destination).trim()) || "Your Trip"
    : (gather.suggestedContext.destination && String(gather.suggestedContext.destination).trim()) || "Your Trip";
  const contextDays = isEditMode
    ? Math.min(10, Math.max(1, Number(context.days) || 3))
    : Math.min(10, Math.max(1, Number(gather.suggestedContext.days) || 3));
  const pace = isEditMode ? (context.pace && String(context.pace).trim()) || "balanced" : gather.suggestedContext.pace || "balanced";

  const userMessages = (messages || [])
    .filter((m) => m && String(m.role).toLowerCase() === "user" && (typeof m.content === "string" || Array.isArray(m.content)))
    .map((m) => getMessageText(m.content))
    .filter((t) => t.trim());
  const lastUserText = userMessages.length ? userMessages[userMessages.length - 1] : "";

  const { requestedDays, isDayChangeRequest } = getRequestedDaysFromLastMessage(lastUserText, contextDays);

  const adapters = getTripAgentAdapters();
  const contextForAdapter = {
    destination,
    days: requestedDays,
    pace,
    preferredDays: requestedDays,
    currentItinerary: context.currentItinerary,
  };

  let plan = null;
  let aiUnconfigured = false;
  let agentUnavailable = false;

  const ADAPTER_TIMEOUT_MS = Number(process.env.TRIP_AGENT_ADAPTER_TIMEOUT_MS) || 8_000;

  if (adapters.length === 0) {
    aiUnconfigured = true;
    plan = buildTripPlan({ destination, days: requestedDays, pace, seed: Date.now() });
  } else {
    const withTimeout = (promise, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Adapter timeout")), ms)),
      ]);
    const results = await Promise.allSettled(
      adapters.map((adapter) =>
        withTimeout(adapter.generateTripFromChat(messages, contextForAdapter), ADAPTER_TIMEOUT_MS).then(
          (p) => (p && Array.isArray(p.itinerary) ? p : null),
          (err) => {
            if (process.env.NODE_ENV !== "production") {
              console.warn("Trip agent [%s] failed:", adapter.name, err?.message || err);
            }
            return null;
          }
        )
      )
    );
    plan = results.map((r) => (r.status === "fulfilled" ? r.value : null)).find((p) => p && Array.isArray(p.itinerary)) || null;
    if (!plan || !Array.isArray(plan.itinerary)) {
      agentUnavailable = true;
      if (process.env.NODE_ENV !== "production" && adapters.length > 0) {
        console.warn("Trip agent: all adapters failed — check messages above. If keys are set, try: restart backend, check quota/rate limits, or set TRIP_AGENT_ADAPTER_TIMEOUT_MS=8000 for slower networks.");
      }
      plan = buildTripPlan({ destination, days: requestedDays, pace, seed: Date.now() });
    }
  }

  normalizePlanToDays(plan, requestedDays);

  const assistantMessage = isDayChangeRequest
    ? (isEditMode
      ? `I've updated your plan to ${requestedDays} days. You can ask for more changes or ask how good the plan is.`
      : `I've created your ${requestedDays}-day plan. You can ask for changes or ask how good the plan is.`)
    : (plan.assistantMessage && String(plan.assistantMessage).trim()) || shortQuestionReply(plan, requestedDays, destination);

  return {
    plan: { ...plan, assistantMessage },
    assistantMessage,
    aiUnconfigured: aiUnconfigured || undefined,
    agentUnavailable: agentUnavailable || undefined,
  };
}

module.exports = {
  handleTripAgentChat,
  getRequestedDaysFromLastMessage,
  shortQuestionReply,
  normalizePlanToDays,
  getMessageText,
};
