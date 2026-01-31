const DEFAULT_API_BASE = "/api";
const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/$/, "");

const getAuthHeaders = () => {
  try {
    const raw = typeof window !== "undefined" && window.localStorage?.getItem("waypoint.user");
    const user = raw ? JSON.parse(raw) : null;
    const token = user?.token;
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  } catch {
    return { "Content-Type": "application/json" };
  }
};

const requestJson = async (path, options, fallbackMessage = "Request failed.") => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options?.headers },
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const message = data?.error || data?.message || fallbackMessage;
    throw new Error(message);
  }
  return data;
};

/**
 * Create a trip (save plan).
 * @param {{ name: string, destination: string, itinerary: Array, days?: number, pace?: string }} payload
 */
export const createTrip = (payload) =>
  requestJson(
    "/trips",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Unable to save trip."
  );

/**
 * List current user's trips.
 * @param {{ status?: string }} [params] - Optional status filter (upcoming, active, completed, archived)
 */
export const fetchTrips = (params) => {
  const search = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
  return requestJson(`/trips${search}`, { method: "GET" }, "Unable to load trips.");
};

/**
 * Get a single trip by ID.
 */
export const fetchTrip = (id) =>
  requestJson(`/trips/${id}`, { method: "GET" }, "Unable to load trip.");

/**
 * Update a trip (partial: name, destination, days, pace, status, itinerary).
 */
export const updateTrip = (id, payload) =>
  requestJson(
    `/trips/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "Unable to update trip."
  );

/**
 * Delete a trip.
 */
export const deleteTrip = (id) =>
  requestJson(`/trips/${id}`, { method: "DELETE" }, "Unable to delete trip.");

/**
 * Archive a trip (sets status to archived).
 */
export const archiveTrip = (id) =>
  requestJson(
    `/trips/${id}/archive`,
    { method: "PATCH" },
    "Unable to archive trip."
  );
