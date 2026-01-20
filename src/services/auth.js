const DEFAULT_API_BASE = "https://tripmakerbe.vercel.app";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const getErrorMessage = (status, data, fallback) => {
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, data, fallbackMessage));
  }

  return data;
};

export const registerUser = (payload) =>
  postJson("/register", payload, "Unable to create your account right now.");

export const loginUser = (payload) =>
  postJson("/login", payload, "Unable to log you in right now.");

