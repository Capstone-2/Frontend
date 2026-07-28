# Frontend Boilerplate — PERN Capstone

A React + Vite frontend for your capstone, wired to the Express/Postgres
backend. It ships with a working example: the **Tasks** pages do full CRUD
against `/api/tasks`, plus **Auth0** login. Copy the example shape for your own
resources, then delete it.

Stack: **React 19** (with the React Compiler) · **React Router v7** ·
**Tailwind CSS v4** · **Auth0** · **Vite**.

## Getting started

```bash
npm install
cp .env.example .env    # then fill in your VITE_ values (see below)
npm run dev             # http://localhost:5173
```

Set these in `.env` (from your Auth0 application + API):

```
VITE_API_URL=http://localhost:8080
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=http://localhost:8080   # must match the backend's AUTH0_AUDIENCE
```

The backend must be running too (see the `backend-boiler` repo) — this app
reads live data from it.

## Structure

```
src/
  main.jsx            wraps the app in <Auth0Provider> + <BrowserRouter>
  App.jsx             the route table + syncs the logged-in user into our DB
  api/
    client.js         fetch wrapper: base URL + shared error handling
    tasks.js          the calls for the "tasks" resource
    auth.js           auth calls; attaches the Auth0 token as a Bearer header
  components/
    Layout.jsx        shared frame (navbar + page slot)
    Navbar.jsx        top navigation + Log in / Log out
    ProtectedRoute.jsx  route guard: redirects to / when not logged in
  pages/
    HomePage.jsx
    TasksPage.jsx     list + create + toggle + delete  (the CRUD example)
    TaskDetailPage.jsx
    ProtectedPage.jsx tests the protected backend endpoint
    NotFoundPage.jsx  the 404 (catch-all route)
```

## How data flows

A page calls a function in `api/tasks.js` → which calls `request()` in
`api/client.js` → which `fetch`es the backend at `VITE_API_URL` → the JSON
comes back and the page stores it in state and renders it.

## Authentication (Auth0)

- `main.jsx` wraps everything in **`<Auth0Provider>`**, so any component can call
  the **`useAuth0()`** hook for login state and actions.
- `Navbar.jsx` uses `loginWithRedirect()` / `logout()` to sign in and out.
- For a protected API call, get a token with **`getAccessTokenSilently()`** and
  pass it to an `api/auth.js` function, which sends it as `Authorization: Bearer <token>`.
- **`<ProtectedRoute>`** wraps any route that should require login.
- On login, `App.jsx` calls `syncUser()` once so the user exists in *our* database.
  Note the two "user" objects: `auth0User` (the Auth0 profile) vs. `currentUser`
  (our own DB row) — they are not the same thing.

## Add your own resource

1. **API** — copy `api/tasks.js` to `api/posts.js`, swap the paths.
2. **Pages** — copy the `pages/Tasks*` files for your resource.
3. **Routes** — add `<Route>`s for them in `App.jsx`.
4. **Nav** — add a `<NavLink>` in `Navbar.jsx`.

## Deploy

- `npm run build` outputs a static site to `dist/`.
- Set `VITE_API_URL` and the `VITE_AUTH0_*` vars to your **deployed** values
  (env vars are baked in at build time, so rebuild after changing them).
- In the Auth0 dashboard, add your deployed URL to **Allowed Callback URLs**,
  **Logout URLs**, and **Web Origins** — otherwise login fails in production.
- `vercel.json` already sends every path to `index.html` so React Router's
  client-side routes work on refresh. On other hosts (Netlify, etc.) add the
  equivalent SPA/rewrite rule.
