// api/client.js — the one place that talks to the backend.
// Every API call goes through request(), so shared logic (base URL, headers,
// error handling) lives in ONE spot instead of being copy-pasted everywhere.

// Where the backend lives. In dev it's your local Express server; in production
// set VITE_API_URL to your deployed backend URL. Vite only exposes vars that
// start with VITE_, and reads them at build time.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // send cookies (needed once you add login/auth)
    ...options,
    // Merge headers LAST so a caller's headers (e.g. Authorization) are added
    // to the defaults instead of replacing them. Spreading ...options first
    // would otherwise wipe out Content-Type.
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  // fetch only throws on a network failure, so we check the HTTP status ourselves.
  if (!res.ok) {
    // Our backend sends errors as { error: "..." }. Fall back if it didn't.
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  // 204 No Content (e.g. after a DELETE) has no body to parse.
  if (res.status === 204) return null;
  return res.json();
}
