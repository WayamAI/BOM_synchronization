# Login gate + repo migration — design

Date: 2026-08-11

## Context

The Wayam AI BOM Synchronization app (Vite + React + TS, shadcn/ui, orange
brand theme) already has its rebrand done — logos (`src/assets/brand/*`),
favicon (`public/favicon.svg`), and the orange color tokens in
`src/index.css` / `tailwind.config.ts` all match the assets the user
supplied. Remaining work:

1. Add a login page that gates the app behind a fixed, randomly-generated
   demo credential pair.
2. Migrate the repo from `arkabera2004/bom-synchronization` to
   `WayamAI/BOM_synchronization` (existing, empty GitHub repo).
3. Redeploy to Vercel under the new project/repo pairing and verify the
   live app works end to end (loads, logs in, navigates).

This is a cosmetic/demo auth gate, not production authentication — no
backend, no hashing, no session expiry. That's an explicit, agreed scope
limit (see brainstorming transcript).

## Login gate

- `src/pages/Login.tsx`: branded card (Wayam logo, light/dark aware,
  orange theme) with email + password `Input`s and a submit `Button`.
  Displays the demo credentials on-screen (e.g. as helper text) so anyone
  opening the deployed app can log in without out-of-band info.
- Credentials: one fixed pair, generated once and hardcoded as constants
  (e.g. in `src/lib/auth.ts`), of the form `<random-name>@gmail.com` /
  a random ~12-character password. Not read from env — they're meant to
  be visible/known, not secret.
- On successful submit: `localStorage.setItem("wayam_auth", "1")`,
  navigate to `/`. On failure: inline error message, no navigation.
- `src/lib/auth.ts` exports `DEMO_EMAIL`, `DEMO_PASSWORD`,
  `isAuthenticated()`, `login(email, password)`, `logout()`.

## Route protection

- `App.tsx` gets a `RequireAuth` wrapper component that reads
  `isAuthenticated()` and either renders its children or `<Navigate to="/login" replace />`.
- Route tree becomes:
  - `/login` → `Login` (standalone, no `AppShell` chrome)
  - `/*` (existing routes) → wrapped in `RequireAuth`, then `AppShell`
  - unknown paths → `NotFound` (unchanged)
- `TopNav`'s existing "Logout" `DropdownMenuItem` calls `logout()` then
  navigates to `/login`.

## Git / repo migration

- `git remote set-url origin https://github.com/WayamAI/BOM_synchronization.git`
- Work happens as a sequence of small, focused commits (branding already
  done; this adds: auth lib, login page, route guard, logout wiring,
  README note) pushed incrementally to `main`.
- Update `README.md` title/clone instructions to reference the new repo
  path, and note the demo-login scope limitation.

## Deploy

- Re-link the Vercel project so it tracks the new GitHub repo (or
  redeploy via `vercel --prod` from the local repo, whichever the
  `vercel:deploy` skill recommends given the existing `.vercel/project.json`
  linkage).
- Verify: production build succeeds, deployed URL loads `/login`,
  demo credentials log in successfully, app shell + a couple of pages
  render correctly, logout returns to `/login`.

## Testing

- Extend/adjust `src/tests/smoke.test.tsx` (or add a new test) to cover:
  redirect to `/login` when unauthenticated, successful login with demo
  credentials navigates past the gate, invalid credentials show an error.
- `npm run build` and `npm run lint` must pass before pushing/deploying.

## Out of scope

- Real user accounts, password storage/hashing, session expiry, multiple
  users, "forgot password," or any backend/auth-provider integration.
