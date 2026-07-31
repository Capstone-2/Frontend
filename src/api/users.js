import { request } from "./client";

const authHeader = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

// GET /users/me
export const getMyProfile = (token) =>
  request("/users/me", {
    headers: authHeader(token),
  });

// GET /Users
/* export const getUsers = (token) =>
  request("/users", {
   headers: authHeader(token),
  }); */

// PATCH /users/me  updates can contain: {displayName & school}
export const updateMyProfile = (token, updates) =>
  request("/users/me", {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(updates),
  });
