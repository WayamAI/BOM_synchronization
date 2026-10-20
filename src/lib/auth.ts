const STORAGE_KEY = "wayam_auth";

// Demo-only gate: no real accounts, no backend. Any syntactically valid
// email and any non-empty password logs in. See docs/superpowers/specs/
// 2026-08-11-login-gate-and-repo-migration-design.md for scope.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// sessionStorage, not localStorage: the login lasts for the tab session only,
// so a new tab or a restarted browser always opens on the login page.
export function isAuthenticated(): boolean {
  return window.sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function login(email: string, password: string): boolean {
  if (EMAIL_PATTERN.test(email.trim()) && password.length > 0) {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
  // Sessions created before this change used localStorage.
  window.localStorage.removeItem(STORAGE_KEY);
}
