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
