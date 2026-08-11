import { describe, it, expect, beforeEach } from "vitest";
import { isAuthenticated, login, logout } from "@/lib/auth";

describe("auth", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts unauthenticated", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("rejects an invalid email and stays unauthenticated", () => {
    expect(login("not-an-email", "anything")).toBe(false);
    expect(isAuthenticated()).toBe(false);
  });

  it("rejects an empty password and stays unauthenticated", () => {
    expect(login("someone@example.com", "")).toBe(false);
    expect(isAuthenticated()).toBe(false);
  });

  it("accepts any valid email with any non-empty password", () => {
    expect(login("anyone.at.all@example.org", "whatever123")).toBe(true);
    expect(isAuthenticated()).toBe(true);
  });

  it("logout clears authentication", () => {
    login("someone@example.com", "whatever");
    logout();
    expect(isAuthenticated()).toBe(false);
  });
});
