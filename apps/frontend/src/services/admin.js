import { requestWithAuth } from "./auth";

export const fetchUsersAdmin = () =>
  requestWithAuth("/admin/users", { method: "GET" }, "Unable to load users.");

export const updateUserAdmin = (id, payload) =>
  requestWithAuth(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  }, "Unable to update user.");

export const createUserAdmin = (payload) =>
  requestWithAuth("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  }, "Unable to create user.");

export const deleteUserAdmin = (id) =>
  requestWithAuth(`/admin/users/${id}`, {
    method: "DELETE",
  }, "Unable to delete user.");

