import { requestJson } from "./auth";

export const generateTripPlan = (payload) =>
  requestJson(
    "/trips/plan",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Unable to build a trip plan right now."
  );
