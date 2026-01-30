import { requestJson } from "./auth";

const PROFILE_STORAGE_KEY = "waypoint.profile";

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
};

export const getStoredProfile = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const saveProfile = (profile) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const clearStoredProfile = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(PROFILE_STORAGE_KEY);
};

export const fetchProfile = (userId) =>
  requestJson(`/profile/${userId}`, { method: "GET" }, "Unable to load profile.");

export const updateProfile = (userId, payload) =>
  requestJson(
    `/profile/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Unable to save your changes."
  );
