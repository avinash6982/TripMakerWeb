import { requestJson } from "./auth";

/**
 * Chat with the AI trip agent. Returns a trip plan (same shape as POST /trips/plan).
 * @param {{ messages: Array<{role: string, content: string}>, context: { destination?: string, days?: number, pace?: string, currentItinerary?: array } }} payload
 * @returns {Promise<object>} Plan with destination, pace, days, itinerary, meta, generatedAt, isFallback
 */
export const chatWithTripAgent = (payload) =>
  requestJson(
    "/trips/agent/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Unable to get a response from the trip assistant."
  );
