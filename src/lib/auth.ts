const STORAGE_KEY = "wayam_auth";

// Demo-only gate: no real accounts, no backend. Any syntactically valid
// email and any non-empty password logs in. See docs/superpowers/specs/
// 2026-08-11-login-gate-and-repo-migration-design.md for scope.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function login(email: string, password: string): boolean {
  if (typeof window === "undefined") return false;
  if (EMAIL_PATTERN.test(email.trim()) && password.length > 0) {
    window.localStorage.setItem(STORAGE_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
