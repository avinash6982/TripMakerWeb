/**
 * Validate and normalize AI trip plan response for persistence (updateTrip).
 * Ensures destination, days, pace, and itinerary match backend contract; prevents malformed data from being saved.
 * Aligns with backend: apps/backend/lib/tripAgent.js validateAndNormalizePlan.
 */

const VALID_CATEGORIES = new Set([
  "landmark", "museum", "park", "food", "viewpoint", "neighborhood",
  "market", "experience", "nightlife", "relax",
]);
const VALID_SLOTS = new Set(["morning", "afternoon", "evening"]);
const VALID_PACES = new Set(["relaxed", "balanced", "fast"]);

function clampDays(n) {
  if (!Number.isFinite(n)) return 3;
  const d = Math.round(Number(n));
  return Math.min(10, Math.max(1, d));
}

function normalizePace(pace) {
  const p = String(pace || "").toLowerCase().trim();
  if (VALID_PACES.has(p)) return p;
  const map = { slow: "relaxed", easy: "relaxed", medium: "balanced", steady: "balanced", active: "fast", "fast-paced": "fast" };
  return map[p] || "balanced";
}

/**
 * Validate and normalize a plan response for updateTrip payload.
 * @param {object} plan - Raw API response (destination, days, pace, itinerary)
 * @param {object} fallback - Fallback values if plan fields missing (e.g. current trip)
 * @returns {{ destination: string, days: number, pace: string, itinerary: array } | null} Normalized payload or null if invalid
 */
export function validateAndNormalizePlanForUpdate(plan, fallback = {}) {
  if (!plan || typeof plan !== "object") return null;

  const dest = (plan.destination && String(plan.destination).trim()) || (fallback.destination && String(fallback.destination).trim()) || "Your Trip";
  const days = clampDays(plan.days ?? fallback.days ?? 3);
  const pace = normalizePace(plan.pace || fallback.pace || "balanced");

  const rawItinerary = Array.isArray(plan.itinerary) ? plan.itinerary : [];
  if (rawItinerary.length === 0) return null;

  const normalizedItinerary = [];
  for (let i = 0; i < Math.min(rawItinerary.length, 10); i++) {
    const day = rawItinerary[i];
    if (!day || typeof day !== "object") continue;
    const slots = Array.isArray(day.slots) ? day.slots : [];
    const normalizedSlots = [];
    let dayTotalHours = 0;
    for (const slot of slots) {
      if (!slot || typeof slot !== "object") continue;
      const timeOfDay = VALID_SLOTS.has(slot.timeOfDay) ? slot.timeOfDay : "morning";
      const items = Array.isArray(slot.items) ? slot.items : [];
      const normalizedItems = items
        .filter((item) => item && typeof item.name === "string" && String(item.name).trim())
        .map((item) => ({
          name: String(item.name).trim(),
          category: VALID_CATEGORIES.has(item.category) ? item.category : "experience",
          durationHours: Number(item.durationHours) > 0 ? Number(item.durationHours) : 1,
        }));
      const slotHours = normalizedItems.reduce((s, it) => s + it.durationHours, 0);
      dayTotalHours += slotHours;
      normalizedSlots.push({ timeOfDay, totalHours: Number(slotHours.toFixed(1)), items: normalizedItems });
    }
    normalizedItinerary.push({
      day: i + 1,
      area: typeof day.area === "string" ? day.area.trim() : "",
      totalHours: Number(dayTotalHours.toFixed(1)),
      slots: normalizedSlots,
    });
  }

  if (normalizedItinerary.length === 0) return null;

  // Pad or trim to match requested days
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
  while (normalizedItinerary.length < days) {
    normalizedItinerary.push(emptyDay(normalizedItinerary.length + 1));
  }
  if (normalizedItinerary.length > days) {
    normalizedItinerary.length = days;
  }

  return {
    destination: dest,
    days: normalizedItinerary.length,
    pace,
    itinerary: normalizedItinerary,
  };
}

/**
 * Quick check: does the plan have a persistable itinerary shape (array, each day has slots)?
 */
export function hasValidItineraryShape(plan) {
  if (!plan || !Array.isArray(plan.itinerary) || plan.itinerary.length < 1) return false;
  return plan.itinerary.every((day) => day && typeof day === "object" && Array.isArray(day.slots));
}
