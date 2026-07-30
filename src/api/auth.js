// api/auth.js — every call about WHO the user is.
//
// Each function below is written out in full: one fetch, one error check, one
// return. Nothing is hidden in a helper file, so you can read any single
// function top to bottom and know exactly what goes over the network.
//
// Yes, they look repetitive. That's on purpose while you're learning. Once the
// shape is second nature, factoring out the shared parts is a good exercise.
//
// THE FOUR PARTS THAT SHOW UP IN EVERY FUNCTION:
//
//   1. BASE_URL          where the backend lives.
//   2. credentials       'include' tells fetch to send our login cookie.
//   3. headers           'Content-Type: application/json' says "my body is JSON".
//   4. if (!res.ok)      fetch does NOT throw on 401/404/500 — we check ourselves.
//
// Notice what is NOT in this file: any code that stores or reads a token.
// The backend puts our JWT in an httpOnly cookie, which JavaScript cannot read
// — and doesn't need to. `credentials: 'include'` makes the browser attach that
// cookie automatically. The Auth0 half is the exception: that token lives in
// Auth0's SDK in memory, so we send it ourselves in an Authorization header.

// In dev this is your local Express server. In production, set VITE_API_URL to
// your deployed backend URL. Vite only exposes env vars starting with VITE_.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ---------------------------------------------------------------------------
// our own JWT (email + password)
// ---------------------------------------------------------------------------

// POST /auth/signup — create the account.
// credentials = { username, email, password }
// On success the response carries a Set-Cookie header, so signing up also logs
// you in. Returns the new user row.
export async function signup(credentials) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    // Send/receive cookies. Off by default, and localhost:5173 -> localhost:8080
    // counts as a different origin, so without this the cookie never arrives.
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),  // fetch will not turn an object into JSON for you.
  });

  // fetch only rejects on a NETWORK failure (server down, DNS, CORS). A 409
  // "email already exists" is still a "successful" fetch, so check res.ok.
  if (!res.ok) {
    // Our backend sends errors as { error: "..." }. Fall back if it didn't.
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Signup failed (${res.status})`);
  }

  return res.json();
}

// POST /auth/login — trade email/username + password for that same cookie.
// credentials = { identifier, password }  (identifier = email OR username)
// Returns the user row.
export async function login(credentials) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // The server deliberately says only "Invalid email/username or password".
    throw new Error(body.error || `Login failed (${res.status})`);
  }

  return res.json();
}

// POST /auth/logout — asks the server to clear the cookie.
// We can't delete an httpOnly cookie from JavaScript, so logging out HAS to be
// a server call. Named "logoutRequest" so it isn't confused with Auth0's own
// logout().
export async function logoutRequest() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Logout failed (${res.status})`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Auth0 (OAuth / social login)
// ---------------------------------------------------------------------------

// POST /auth/auth0 — store the OAuth user in our database if they're new.
// The backend uses findOrCreate, so this CREATES the row on the first social
// login and RETURNS the existing one every time after. Identity (auth0Id,
// email) is read from the token on the backend — we only send app-specific
// fields like username.
//
// token   = the Auth0 access token, from getAccessTokenSilently()
// profile = { username }
export async function syncUser(token, profile) {
  const res = await fetch(`${BASE_URL}/auth/auth0`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // The Auth0 token is not in a cookie, so we attach it by hand. "Bearer"
      // is just the standard word that goes before the token in this header.
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not sync user (${res.status})`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// works with either credential
// ---------------------------------------------------------------------------

// GET /auth/me — the logged-in user's row from OUR database.
// The backend's requireAuth accepts the cookie OR a Bearer token, so this one
// function serves both kinds of user: pass a token for Auth0 users, pass
// nothing for password users and the cookie does the work.
//
// A 401 from this endpoint is the normal "not logged in" answer, not a bug.
export async function getMe(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/auth/me`, {
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Not logged in (${res.status})`);
  }

  return res.json();
}

// GET /api/protected — a tiny endpoint that just confirms auth works.
// Handy for checking that login and the credential are wired up correctly.
export async function getProtected(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api/protected`, {
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}