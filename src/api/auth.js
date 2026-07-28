// api/auth.js — every call for authentication + our own user record, in one
// file. Same shape as tasks.js: thin wrappers around request(). The one extra
// thing here is the Auth0 access token, which we send in the Authorization
// header so the backend can verify WHO is calling and read their identity.

import { request } from './client';

// Send the Auth0 access token as a Bearer header. The backend's jwtCheck
// middleware verifies it and exposes the user's identity (sub, email, ...).
const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// GET /api/protected — a tiny endpoint that just confirms the token works.
// Handy for testing that login + the Authorization header are wired up.
export const getProtected = (token) =>
  request('/api/protected', { headers: authHeader(token) });

// GET /auth/me — fetch the logged-in user's row from OUR database.
// Returns 404 (throws here) if we haven't stored them yet.
export const getMe = (token) =>
  request('/auth/me', { headers: authHeader(token) });

// POST /auth/auth0 — store the user in our database if they don't exist yet.
// The backend uses findOrCreate, so this CREATES the user the first time and
// RETURNS the existing record afterwards. Identity (auth0Id, email) is read
// from the token on the backend — we only send app-specific fields like username.
export const syncUser = (token, profile) =>
  request('/auth/auth0', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(profile),
  });
