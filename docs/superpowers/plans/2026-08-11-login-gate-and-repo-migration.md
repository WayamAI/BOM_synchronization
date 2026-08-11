# Login Gate + Repo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the Wayam AI BOM app behind a demo login screen, migrate the repo to `WayamAI/BOM_synchronization`, and redeploy to Vercel.

**Architecture:** A `src/lib/auth.ts` module owns a fixed demo credential pair and a `localStorage`-backed session flag. `src/pages/Login.tsx` is a standalone branded page (no `AppShell` chrome) that calls into it. `App.tsx` wraps the existing route tree in a `RequireAuth` guard that redirects to `/login` when unauthenticated. `TopNav`'s existing Logout item calls `logout()`.

**Tech Stack:** Vite + React 18 + TypeScript, react-router-dom v6, shadcn/ui (Card, Input, Button, Label), Tailwind (existing orange theme tokens), Vitest + Testing Library.

## Global Constraints

- No backend, no password hashing, no session expiry — this is a cosmetic demo gate (spec: "Out of scope").
- Demo credentials must be visibly displayed on the login page itself (spec: "Login gate").
- Credential format: `<random-name>@gmail.com` / random ~12-char password, hardcoded constants (spec: "Login gate").
- `/login` renders standalone, outside `AppShell` (spec: "Route protection").
- Follow existing code style: named exports, `@/` path alias, Tailwind utility classes, shadcn/ui primitives — no new UI kit.
- `npm run build` and `npm run lint` must pass before pushing (spec: "Testing").
- Final repo remote must be `https://github.com/WayamAI/BOM_synchronization.git` (spec: "Git / repo migration").

---

### Task 1: Auth module

**Files:**
- Create: `src/lib/auth.ts`
- Test: `src/tests/auth.test.ts`

**Interfaces:**
- Produces: `DEMO_EMAIL: string`, `DEMO_PASSWORD: string`, `isAuthenticated(): boolean`, `login(email: string, password: string): boolean`, `logout(): void`. All later tasks (Login page, RequireAuth, TopNav) import from this module.

- [ ] **Step 1: Write the failing test**

```typescript
// src/tests/auth.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { DEMO_EMAIL, DEMO_PASSWORD, isAuthenticated, login, logout } from "@/lib/auth";

describe("auth", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts unauthenticated", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("rejects wrong credentials and stays unauthenticated", () => {
    expect(login("wrong@gmail.com", "wrong")).toBe(false);
    expect(isAuthenticated()).toBe(false);
  });

  it("accepts the demo credentials and becomes authenticated", () => {
    expect(login(DEMO_EMAIL, DEMO_PASSWORD)).toBe(true);
    expect(isAuthenticated()).toBe(true);
  });

  it("logout clears authentication", () => {
    login(DEMO_EMAIL, DEMO_PASSWORD);
    logout();
    expect(isAuthenticated()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/auth.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/auth"`

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/auth.ts
const STORAGE_KEY = "wayam_auth";

// Demo-only credentials for the login gate. Not a real account —
// intentionally shown on the login screen. See docs/superpowers/specs/
// 2026-08-11-login-gate-and-repo-migration-design.md for scope.
export const DEMO_EMAIL = "sana.varkey42@gmail.com";
export const DEMO_PASSWORD = "Wy9!krmt2Lpz";

export function isAuthenticated(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function login(email: string, password: string): boolean {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    window.localStorage.setItem(STORAGE_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/auth.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/tests/auth.test.ts
git commit -m "Add demo auth module with login/logout/isAuthenticated"
```

---

### Task 2: Login page

**Files:**
- Create: `src/pages/Login.tsx`

**Interfaces:**
- Consumes: `DEMO_EMAIL`, `DEMO_PASSWORD`, `login` from `@/lib/auth` (Task 1); `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` from `@/components/ui/card`; `Input` from `@/components/ui/input`; `Label` from `@/components/ui/label`; `Button` from `@/components/ui/button`; `wayam-logo-light.svg` / `wayam-logo-dark.svg` from `@/assets/brand` (same pattern as `TopNav.tsx`).
- Produces: default export `Login` — a route-level page component. Reads no props/params; on success calls `navigate("/", { replace: true })`.

- [ ] **Step 1: Write the component**

```tsx
// src/pages/Login.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import wayamLogoLight from "@/assets/brand/wayam-logo-light.svg";
import wayamLogoDark from "@/assets/brand/wayam-logo-dark.svg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEMO_EMAIL, DEMO_PASSWORD, login } from "@/lib/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate("/", { replace: true });
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center space-y-3">
          <img src={wayamLogoLight} alt="Wayam AI" className="h-8 w-auto dark:hidden" />
          <img src={wayamLogoDark} alt="Wayam AI" className="hidden h-8 w-auto dark:block" />
          <CardTitle>Sign in</CardTitle>
          <CardDescription>BOM Synchronization Command Center</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={DEMO_EMAIL}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="mt-6 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Demo credentials</p>
            <p>Email: {DEMO_EMAIL}</p>
            <p>Password: {DEMO_PASSWORD}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
```

- [ ] **Step 2: Manual check**

Run: `npm run dev`, open `http://localhost:8080/login` directly in a browser.
Expected: branded card renders, demo credentials are visible, wrong credentials show the error text, correct credentials navigate away (route not wired yet, so this may 404 until Task 3 — that's fine, just confirm no console errors and the form submits without throwing).

- [ ] **Step 3: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "Add branded Login page with demo-credential form"
```

---

### Task 3: Route guard + wiring

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/TopNav.tsx:178` (Logout item)

**Interfaces:**
- Consumes: `isAuthenticated`, `logout` from `@/lib/auth` (Task 1); `Login` from `@/pages/Login` (Task 2).
- Produces: `RequireAuth` component defined inline in `App.tsx` (not exported elsewhere — only consumed within this file's route tree).

- [ ] **Step 1: Add `RequireAuth` and the `/login` route in `App.tsx`**

Edit `src/App.tsx`. Add the import and guard component, then restructure the `<Routes>` block:

```tsx
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { isAuthenticated } from "@/lib/auth";
```

```tsx
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
```

Replace the `<Route element={<AppShell />}>` wrapper so `AppShell` itself is gated:

```tsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route
    element={
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    }
  >
    <Route path="/"             element={<Dashboard />} />
    <Route path="/variants"     element={<Variants />} />
    <Route path="/ebom"         element={<EbomManager />} />
    <Route path="/mbom"         element={<MbomManager />} />
    <Route path="/service"      element={<ServiceBom />} />
    <Route path="/software"     element={<SoftwareBom />} />
    <Route path="/changes"      element={<Changes />} />
    <Route path="/changes/:id"  element={<Changes />} />
    <Route path="/compare"      element={<BomCompare />} />
    <Route path="/parts"        element={<PartMaster />} />
    <Route path="/parts/:pn"    element={<PartMaster />} />
    <Route path="/suppliers"    element={<SupplierIntel />} />
    <Route path="/field"        element={<FieldQuality />} />
    <Route path="/reports"      element={<Reports />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

Note: `RequireAuth` wraps `<AppShell />` directly as the layout route's `element`, so `<AppShell />`'s own `<Outlet />` still renders the child page routes — `RequireAuth`'s `children` prop is `<AppShell />`, not the matched child route.

- [ ] **Step 2: Wire Logout in `TopNav.tsx`**

Read `src/components/layout/TopNav.tsx` around line 178 to get exact current context, then:

```tsx
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
```

Inside the `TopNav` component body, add:

```tsx
const navigate = useNavigate();
```

(Skip this if `TopNav` already destructures `useLocation` from `react-router-dom` in a way that a second `useNavigate()` call would conflict — it won't; they're independent hooks.)

Replace the existing `<DropdownMenuItem>Logout</DropdownMenuItem>` with:

```tsx
<DropdownMenuItem
  onClick={() => {
    logout();
    navigate("/login", { replace: true });
  }}
>
  Logout
</DropdownMenuItem>
```

- [ ] **Step 3: Update the smoke test to authenticate before rendering gated routes**

Edit `src/tests/smoke.test.tsx` — add a `beforeEach` that sets the auth flag so the existing per-page smoke assertions keep testing what they tested before (page renders), not the redirect:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
```

```tsx
beforeEach(() => {
  window.localStorage.setItem("wayam_auth", "1");
});
```

(Insert this as the first statement inside the existing `describe("smoke", () => { ... })` block, before the `pages` array.)

- [ ] **Step 4: Run the full test suite**

Run: `npm run test`
Expected: PASS — all existing smoke tests plus the new `auth.test.ts` tests.

- [ ] **Step 5: Run build and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/layout/TopNav.tsx src/tests/smoke.test.tsx
git commit -m "Gate app routes behind login; wire logout to clear session"
```

---

### Task 4: Redirect and login-flow tests

**Files:**
- Create: `src/tests/login.test.tsx`

**Interfaces:**
- Consumes: `Login` (Task 2), `RequireAuth`-gated route tree pattern from `App.tsx` (Task 3), `DEMO_EMAIL`/`DEMO_PASSWORD`/`isAuthenticated` from `@/lib/auth` (Task 1).

- [ ] **Step 1: Write the failing test**

```tsx
// src/tests/login.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import { DEMO_EMAIL, DEMO_PASSWORD, isAuthenticated } from "@/lib/auth";

const Protected = () => (isAuthenticated() ? <div>Protected content</div> : <Navigate to="/login" replace />);

const renderApp = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected />} />
      </Routes>
    </MemoryRouter>,
  );

describe("login flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("redirects unauthenticated visitors to /login", () => {
    renderApp("/");
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("shows an error on invalid credentials and stays on /login", () => {
    renderApp("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "wrong@gmail.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
  });

  it("navigates past the gate on valid demo credentials", () => {
    renderApp("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: DEMO_EMAIL } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: DEMO_PASSWORD } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails or passes**

Run: `npx vitest run src/tests/login.test.tsx`
Expected: Should PASS immediately since Login/auth already exist from Tasks 1–2 — this task is a regression-test addition, not new production code. If it fails, fix `Login.tsx` (e.g. `Label`/`htmlFor` wiring) until it passes — do not weaken the test.

- [ ] **Step 3: Run full suite once more**

Run: `npm run test`
Expected: PASS, all files.

- [ ] **Step 4: Commit**

```bash
git add src/tests/login.test.tsx
git commit -m "Add login-flow regression tests (redirect, invalid, success)"
```

---

### Task 5: README update

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update clone URL and add a login-scope note**

Edit `README.md`: change any reference to the old repo path to
`https://github.com/WayamAI/BOM_synchronization.git`, and add a short
"Login" section under "Getting started" noting this is a demo gate with
on-screen credentials, not real authentication.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Update README with new repo URL and login-gate note"
```

---

### Task 6: Repo migration and push

**Files:** none (git operations only)

- [ ] **Step 1: Repoint origin**

```bash
git remote set-url origin https://github.com/WayamAI/BOM_synchronization.git
git remote -v
```

Expected: both `fetch` and `push` show the new URL.

- [ ] **Step 2: Push main**

```bash
git push -u origin main
```

Expected: push succeeds (repo is empty, so this is a fresh push, not force).

---

### Task 7: Vercel redeploy and verification

**Files:** none (deploy operations only)

- [ ] **Step 1: Re-link the Vercel project to the new repo (or redeploy from local)**

Use the `vercel:deploy` skill's guidance given the existing `.vercel/project.json` linkage (`bom-synchronization` project). If the Vercel project's connected Git repo needs updating to point at `WayamAI/BOM_synchronization`, do that in the Vercel dashboard/CLI per the skill; otherwise deploy directly from the local repo:

```bash
vercel --prod
```

- [ ] **Step 2: Verify the live deployment**

Open the production URL returned by the deploy. Confirm:
- `/` redirects to `/login`
- the Wayam logo, orange theme render correctly
- demo credentials log in successfully and land on the Dashboard
- Logout returns to `/login`

- [ ] **Step 3: Report the live URL and deployment status back to the user**

No commit — this is a verification step.
