const DEFAULT_API_BASE = "/api";
const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/$/, "");

/** Base URL for API (used for media redirects). */
export const getApiBaseUrl = () => API_BASE_URL;

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
 * Fetch public trip feed (MVP2). Auth optional; when sent, feed includes userLiked per trip (MVP3).
 * @param {{ destination?: string, interest?: string, limit?: number }} [params]
 */
export const fetchFeed = async (params) => {
  const search = new URLSearchParams();
  if (params?.destination) search.set("destination", params.destination);
  if (params?.interest) search.set("interest", params.interest);
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const path = `/trips/feed${qs ? `?${qs}` : ""}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: getAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Unable to load feed.");
  return data;
};

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

/**
 * Unarchive a trip (sets status back to upcoming).
 */
export const unarchiveTrip = (id) =>
  requestJson(
    `/trips/${id}/unarchive`,
    { method: "PATCH" },
    "Unable to unarchive trip."
  );

/**
 * Create invite code (MVP2).
 * @param {string} tripId
 * @param {string} role - viewer | editor
 */
export const createInvite = (tripId, role = "viewer") =>
  requestJson(
    `/trips/${tripId}/invite`,
    { method: "POST", body: JSON.stringify({ role }) },
    "Unable to create invite."
  );

/**
 * Redeem invite code (MVP2).
 */
export const redeemInvite = (code) =>
  requestJson(
    "/invite/redeem",
    { method: "POST", body: JSON.stringify({ code }) },
    "Invalid or expired invite code."
  );

/**
 * Remove a collaborator from a trip (owner or editor; only owner can remove editors).
 * @param {string} tripId
 * @param {string} userId - Collaborator's user ID to remove
 */
export const removeCollaborator = (tripId, userId) =>
  requestJson(
    `/trips/${tripId}/collaborators/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
    "Unable to remove collaborator."
  );

/**
 * Add a prerequisite item (Additional feature: trip prerequisites). Collaborator only.
 * @param {string} tripId
 * @param {{ title: string, description?: string, category?: string, imageKey?: string, assigneeUserId?: string }} payload
 */
export const addPrerequisite = (tripId, payload) =>
  requestJson(
    `/trips/${tripId}/prerequisites`,
    { method: "POST", body: JSON.stringify(payload) },
    "Unable to add prerequisite."
  );

/**
 * Update a prerequisite item (title, description, category, imageKey). Not allowed when trip is completed.
 * @param {string} tripId
 * @param {string} itemId
 * @param {{ title?: string, description?: string, category?: string, imageKey?: string }} payload
 */
export const updatePrerequisite = (tripId, itemId, payload) =>
  requestJson(
    `/trips/${tripId}/prerequisites/${encodeURIComponent(itemId)}`,
    { method: "PUT", body: JSON.stringify(payload) },
    "Unable to update prerequisite."
  );

/**
 * Update prerequisite assignee or status. Only when trip is active.
 * @param {string} tripId
 * @param {string} itemId
 * @param {{ assigneeUserId?: string | null, status?: 'pending' | 'done' }} payload
 */
export const patchPrerequisite = (tripId, itemId, payload) =>
  requestJson(
    `/trips/${tripId}/prerequisites/${encodeURIComponent(itemId)}`,
    { method: "PATCH", body: JSON.stringify(payload) },
    "Unable to update prerequisite."
  );

/**
 * Delete a prerequisite item. Not allowed when trip is completed.
 * @param {string} tripId
 * @param {string} itemId
 */
export const deletePrerequisite = (tripId, itemId) =>
  requestJson(
    `/trips/${tripId}/prerequisites/${encodeURIComponent(itemId)}`,
    { method: "DELETE" },
    "Unable to delete prerequisite."
  );

/**
 * Fetch chat messages for a trip (MVP3). Paginated.
 * @param {string} tripId
 * @param {{ limit?: number, offset?: number }} [params]
 */
export const fetchTripMessages = (tripId, params = {}) => {
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  const path = `/trips/${tripId}/messages${qs ? `?${qs}` : ""}`;
  return requestJson(path, { method: "GET" }, "Unable to load messages.");
};

/**
 * Get presigned upload URL for R2 (MVP3.6). Call PUT to uploadUrl with file body, then post message with imageKey.
 * @param {number} size - File size in bytes
 * @param {string} contentType - e.g. image/jpeg
 */
export const getUploadPresign = (size, contentType) =>
  requestJson(
    "/upload/presign",
    {
      method: "POST",
      body: JSON.stringify({ size: Number(size), contentType: String(contentType || "image/jpeg") }),
    },
    "Unable to get upload URL."
  );

/**
 * Post a chat message to a trip (MVP3). Optional imageKey after uploading via presign.
 * @param {string} tripId
 * @param {{ text: string, imageKey?: string }} payload
 */
export const postTripMessage = (tripId, payload) => {
  const body = { text: String(payload?.text ?? "").trim() };
  if (payload?.imageKey) body.imageKey = String(payload.imageKey).trim();
  return requestJson(
    `/trips/${tripId}/messages`,
    { method: "POST", body: JSON.stringify(body) },
    "Unable to send message."
  );
};

/**
 * Like a public trip (MVP3).
 * @param {string} tripId
 */
export const likeTrip = (tripId) =>
  requestJson(`/trips/${tripId}/like`, { method: "POST" }, "Unable to like trip.");

/**
 * Unlike a public trip (MVP3).
 * @param {string} tripId
 */
export const unlikeTrip = (tripId) =>
  requestJson(`/trips/${tripId}/like`, { method: "DELETE" }, "Unable to unlike trip.");

/**
 * Get comments for a trip (MVP3).
 * @param {string} tripId
 * @param {{ limit?: number, offset?: number }} [params]
 */
export const fetchTripComments = (tripId, params = {}) => {
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  const path = `/trips/${tripId}/comments${qs ? `?${qs}` : ""}`;
  return requestJson(path, { method: "GET" }, "Unable to load comments.");
};

/**
 * Post a comment on a trip (MVP3). Optional imageKey (MVP3.11).
 * @param {string} tripId
 * @param {{ text: string, imageKey?: string }} payload
 */
export const postTripComment = (tripId, payload) => {
  const body = { text: String(payload?.text ?? "").trim() };
  if (payload?.imageKey) body.imageKey = String(payload.imageKey).trim();
  return requestJson(
    `/trips/${tripId}/comments`,
    { method: "POST", body: JSON.stringify(body) },
    "Unable to post comment."
  );
};

/**
 * Fetch trip gallery (MVP3.9).
 * @param {string} tripId
 */
export const fetchGallery = (tripId) =>
  requestJson(`/trips/${tripId}/gallery`, { method: "GET" }, "Unable to load gallery.");

/**
 * Add image to trip gallery (MVP3.9).
 * @param {string} tripId
 * @param {{ imageKey: string }} payload
 */
export const postGalleryImage = (tripId, payload) =>
  requestJson(
    `/trips/${tripId}/gallery`,
    { method: "POST", body: JSON.stringify({ imageKey: String(payload?.imageKey ?? "").trim() }) },
    "Unable to add image."
  );

/**
 * Like a gallery image (MVP3.9).
 * @param {string} tripId
 * @param {string} imageId
 */
export const likeGalleryImage = (tripId, imageId) =>
  requestJson(`/trips/${tripId}/gallery/${encodeURIComponent(imageId)}/like`, { method: "POST" }, "Unable to like.");

/**
 * Unlike a gallery image (MVP3.9).
 * @param {string} tripId
 * @param {string} imageId
 */
export const unlikeGalleryImage = (tripId, imageId) =>
  requestJson(`/trips/${tripId}/gallery/${encodeURIComponent(imageId)}/like`, { method: "DELETE" }, "Unable to unlike.");

/**
 * Fetch comments for a gallery image (MVP3.9).
 * @param {string} tripId
 * @param {string} imageId
 * @param {{ limit?: number, offset?: number }} [params]
 */
export const fetchGalleryImageComments = (tripId, imageId, params = {}) => {
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  const path = `/trips/${tripId}/gallery/${encodeURIComponent(imageId)}/comments${qs ? `?${qs}` : ""}`;
  return requestJson(path, { method: "GET" }, "Unable to load comments.");
};

/**
 * Post a comment on a gallery image (MVP3.9). Optional imageKey (MVP3.11).
 * @param {string} tripId
 * @param {string} imageId
 * @param {{ text: string, imageKey?: string }} payload
 */
export const postGalleryImageComment = (tripId, imageId, payload) => {
  const body = { text: String(payload?.text ?? "").trim() };
  if (payload?.imageKey) body.imageKey = String(payload.imageKey).trim();
  return requestJson(
    `/trips/${tripId}/gallery/${encodeURIComponent(imageId)}/comments`,
    { method: "POST", body: JSON.stringify(body) },
    "Unable to post comment."
  );
};
