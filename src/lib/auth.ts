const STORAGE_KEY = "wayam_auth";

// Demo-only credentials for the login gate. Not a real account —
// intentionally shown on the login screen. See docs/superpowers/specs/
// 2026-08-11-login-gate-and-repo-migration-design.md for scope.
export const DEMO_EMAIL = "omar.tessa55@gmail.com";
export const DEMO_PASSWORD = "pzS5iPXZYSi!W";

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
