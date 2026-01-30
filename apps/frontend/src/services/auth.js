// In production (monorepo), API is at /api
// In development, use full URL to backend server
const DEFAULT_API_BASE = "/api";

const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/$/, "");
const USER_STORAGE_KEY = "waypoint.user";

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const getErrorMessage = (status, data, fallback) => {
  if (data?.error) {
    return data.error;
  }

  if (data?.message) {
    return data.message;
  }

  if (status === 400) {
    return "Email and password are required.";
  }

  if (status === 401) {
    return "The email or password is incorrect.";
  }

  if (status === 409) {
    return "That email is already registered.";
  }

  return fallback;
};

const postJson = async (path, payload, fallbackMessage) => {
  return requestJson(
    path,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    fallbackMessage
  );
};

export const registerUser = (payload) =>
  postJson("/register", payload, "Unable to create your account right now.");

export const loginUser = (payload) =>
  postJson("/login", payload, "Unable to log you in right now.");

export const requestJson = async (path, options, fallbackMessage) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, data, fallbackMessage));
  }

  return data;
};

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
};

export const getStoredUser = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const setStoredUser = (user) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("authchange"));
};

export const clearStoredUser = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event("authchange"));
};

